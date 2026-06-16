import { Notice, Plugin } from "obsidian";
import { createDefaultSettings, type XhsVaultSyncSettings } from "./settings";
import {
  appendSyncLog,
  createIdleStatus,
  formatStatusLine,
  sanitizeStatusMessage,
  type SyncPhase,
  type SyncStatusSnapshot
} from "./sync/status";
import { switchAccountSyncState } from "./sync/account-state";
import { SyncEngine } from "./sync/sync-engine";
import { LoginModal } from "./ui/login-modal";
import { OnboardingModal } from "./ui/onboarding-modal";
import { XhsVaultSyncSettingTab } from "./ui/settings-tab";
import { SyncStatusModal } from "./ui/status-modal";
import type { SyncTarget } from "./settings";
import { XhsApi } from "./xhs/api";
import { readXhsCookieHeader } from "./xhs/cookies";
import { SignManager } from "./xhs/sign-manager";

const SUPPORTED_SYNC_TARGETS: SyncTarget[] = ["bookmark", "post", "like", "album"];

function isSupportedSyncTarget(value: unknown): value is SyncTarget {
  return SUPPORTED_SYNC_TARGETS.includes(value as SyncTarget);
}

function normalizeActiveSyncTarget(value: unknown): SyncTarget {
  return isSupportedSyncTarget(value) ? value : "bookmark";
}

function normalizeSyncTargets(values: unknown, fallback: SyncTarget[]): SyncTarget[] {
  const filtered = Array.isArray(values)
    ? values.filter(isSupportedSyncTarget)
    : fallback.filter(isSupportedSyncTarget);
  return filtered.length ? filtered : ["bookmark"];
}

export default class XhsVaultSyncPlugin extends Plugin {
  settings: XhsVaultSyncSettings = createDefaultSettings();
  private syncEngine: SyncEngine | null = null;
  private syncIntervalId: number | null = null;
  private statusBarEl: HTMLElement | null = null;
  private isSyncing = false;
  private isUnloaded = false;

  async onload(): Promise<void> {
    this.isUnloaded = false;
    await this.loadSettings();
    this.syncEngine = new SyncEngine(this);
    this.addSettingTab(new XhsVaultSyncSettingTab(this.app, this));
    this.statusBarEl = this.addStatusBarItem();
    const now = Date.now();
    await this.updateSyncStatus(
      this.settings.a1Cookie
        ? createIdleStatus(now)
        : {
            ...createIdleStatus(now),
            phase: "not_logged_in",
            message: "未登录"
          },
      { recordLog: false }
    );

    this.addCommand({
      id: "xhs-vault-sync-login",
      name: "Log in to Xiaohongshu",
      callback: () => this.openLoginModal()
    });

    this.addCommand({
      id: "xhs-vault-sync-now",
      name: "Sync bookmarks now",
      callback: () => void this.syncNow()
    });

    this.addCommand({
      id: "xhs-vault-sync-status",
      name: "Show sync status",
      callback: () => this.openStatusModal()
    });

    this.startSyncInterval();
    this.openOnboardingModalAfterDelay();
  }

  async loadSettings(): Promise<void> {
    const defaults = createDefaultSettings();
    const loaded = (await this.loadData()) as Partial<XhsVaultSyncSettings> | null;

    this.settings = Object.assign(defaults, loaded, {
      cookies: "",
      activeSyncTarget: normalizeActiveSyncTarget(loaded?.activeSyncTarget),
      syncCursors: { ...(loaded?.syncCursors ?? {}) },
      syncedIds: { ...(loaded?.syncedIds ?? {}) },
      syncTargets: normalizeSyncTargets(loaded?.syncTargets, defaults.syncTargets),
      downloadVideos: loaded?.downloadVideos ?? defaults.downloadVideos,
      enableAiClassify: loaded?.enableAiClassify ?? defaults.enableAiClassify,
      openaiApiKey: loaded?.openaiApiKey ?? defaults.openaiApiKey,
      openaiBaseUrl: loaded?.openaiBaseUrl ?? defaults.openaiBaseUrl,
      openaiModel: loaded?.openaiModel ?? defaults.openaiModel,
      categories: Array.isArray(loaded?.categories) ? loaded.categories : defaults.categories,
      allSynced: { ...(loaded?.allSynced ?? {}) },
      albumWhitelist: { ...(loaded?.albumWhitelist ?? {}) },
      lastAlbumSnapshot: [...(loaded?.lastAlbumSnapshot ?? [])],
      bookmarkCateNextCursor: { ...(loaded?.bookmarkCateNextCursor ?? {}) },
      cateSyncAllBookmark: { ...(loaded?.cateSyncAllBookmark ?? {}) },
      perAccountState: { ...(loaded?.perAccountState ?? {}) },
      syncStatusSnapshot: {
        ...defaults.syncStatusSnapshot,
        ...(loaded?.syncStatusSnapshot ?? {}),
        message: sanitizeStatusMessage(
          loaded?.syncStatusSnapshot?.message ?? defaults.syncStatusSnapshot.message
        ),
        lastError:
          loaded?.syncStatusSnapshot?.lastError === undefined
            ? undefined
            : sanitizeStatusMessage(loaded.syncStatusSnapshot.lastError)
      },
      syncLog: [...(loaded?.syncLog ?? [])].map((entry) => ({
        ...entry,
        message: sanitizeStatusMessage(entry.message)
      })),
      lastSyncError: sanitizeStatusMessage(
        loaded?.lastSyncError ?? defaults.lastSyncError
      ),
      hasSeenOnboarding: loaded?.hasSeenOnboarding ?? defaults.hasSeenOnboarding
    });
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  openLoginModal(): void {
    new LoginModal(this).open();
  }

  openStatusModal(): void {
    new SyncStatusModal(this).open();
  }

  private openOnboardingModalAfterDelay(): void {
    if (this.settings.hasSeenOnboarding) return;
    if (typeof window === "undefined") return;

    window.setTimeout(() => {
      if (this.isUnloaded || this.settings.hasSeenOnboarding) return;
      new OnboardingModal(this).open();
    }, 500);
  }

  async updateSyncStatus(
    partial: Partial<SyncStatusSnapshot> & { phase: SyncPhase; message: string },
    options: { recordLog?: boolean } = {}
  ): Promise<void> {
    if (this.isUnloaded) return;

    const now = Date.now();
    const previous = this.settings.syncStatusSnapshot ?? createIdleStatus(now);
    const safeMessage = sanitizeStatusMessage(partial.message);
    const safeLastError =
      partial.lastError === undefined
        ? undefined
        : sanitizeStatusMessage(partial.lastError);
    const next: SyncStatusSnapshot = {
      ...previous,
      ...partial,
      message: safeMessage,
      updatedAt: now
    };
    if (safeLastError !== undefined) {
      next.lastError = safeLastError;
    }

    this.settings.syncStatusSnapshot = next;
    if (options.recordLog !== false) {
      this.settings.syncLog = appendSyncLog(this.settings.syncLog ?? [], {
        time: now,
        phase: next.phase,
        message: next.message
      });
    }
    this.statusBarEl?.setText(formatStatusLine(next));
    await this.saveSettings();
  }

  async syncNow(): Promise<void> {
    if (this.isUnloaded) return;
    if (!this.settings.a1Cookie) {
      new Notice("请先登录小红书，再执行同步。");
      return;
    }
    if (this.isSyncing) return;

    this.isSyncing = true;
    try {
      await this.syncEngine?.syncBookmarks();
    } finally {
      this.isSyncing = false;
    }
  }

  async refreshAlbums(): Promise<void> {
    if (!this.settings.a1Cookie) {
      new Notice("请先登录小红书，再刷新专辑列表。");
      return;
    }

    const signer = new SignManager();
    try {
      await this.updateSyncStatus({
        phase: "collecting",
        message: "正在刷新专辑列表"
      });
      await signer.initWebview();
      const visibleCookies = `a1=${this.settings.a1Cookie}`;
      const cookies = await readXhsCookieHeader(visibleCookies);
      this.settings.cookies = "";
      const api = new XhsApi(signer, cookies);
      const user = await api.getCurrentUser();
      switchAccountSyncState(this.settings, user);
      this.settings.lastAlbumSnapshot = await api.getUserBoards(user.userId);
      await this.saveSettings();
      await this.updateSyncStatus({
        phase: "idle",
        message: `已刷新 ${this.settings.lastAlbumSnapshot.length} 个专辑`
      });
      new Notice(`已刷新 ${this.settings.lastAlbumSnapshot.length} 个专辑。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const safeMessage = sanitizeStatusMessage(message);
      this.settings.lastSyncError = safeMessage;
      await this.updateSyncStatus({
        phase: "failed",
        message: safeMessage,
        lastError: safeMessage
      });
      new Notice(`刷新专辑列表失败：${safeMessage}`);
      throw error;
    } finally {
      signer.destroy();
    }
  }

  startSyncInterval(): void {
    this.stopSyncInterval();
    if (!this.settings.autoSyncEnabled) return;
    const minutes = Math.max(5, this.settings.syncIntervalMinutes);
    this.syncIntervalId = this.registerInterval(
      window.setInterval(() => void this.syncNow(), minutes * 60 * 1000)
    );
  }

  stopSyncInterval(): void {
    if (this.syncIntervalId !== null) {
      window.clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  onunload(): void {
    this.isUnloaded = true;
    this.stopSyncInterval();
  }
}
