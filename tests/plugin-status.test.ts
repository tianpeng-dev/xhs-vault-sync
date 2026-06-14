import { describe, expect, it, vi } from "vitest";
import XhsVaultSyncPlugin from "../src/main";
import { createDefaultSettings } from "../src/settings";
import { createIdleStatus } from "../src/sync/status";
import { OnboardingModal } from "../src/ui/onboarding-modal";
import { SyncStatusModal } from "../src/ui/status-modal";

type PluginHarness = XhsVaultSyncPlugin & {
  __statusBarItems?: HTMLElement[];
  __commands?: PluginCommand[];
  __registeredIntervals?: number[];
  __savedData?: unknown;
  loadData: () => Promise<unknown>;
  saveData: (data: unknown) => Promise<void>;
};

type PluginCommand = {
  id: string;
  name: string;
  callback: () => void;
};

function createPlugin(loadedData: unknown = null): PluginHarness {
  const plugin = new XhsVaultSyncPlugin({} as never, {} as never) as PluginHarness;
  plugin.loadData = vi.fn(async () => loadedData);
  plugin.saveData = vi.fn(async (data: unknown) => {
    plugin.__savedData = structuredClone(data);
  });
  return plugin;
}

describe("插件状态栏契约", () => {
  it("加载时初始化状态栏并显示未登录中文状态", async () => {
    const plugin = createPlugin();

    await plugin.onload();

    expect(plugin.__statusBarItems).toHaveLength(1);
    expect(plugin.__statusBarItems?.[0].textContent).toBe("小红书：未登录");
    expect(plugin.settings.syncStatusSnapshot).toMatchObject({
      phase: "not_logged_in",
      message: "未登录"
    });
    expect(plugin.settings.syncLog).toEqual([]);
    expect(plugin.saveData).toHaveBeenCalled();
  });

  it("加载时注册状态 Modal 命令并可打开状态窗口", async () => {
    const plugin = createPlugin({
      ...createDefaultSettings(),
      a1Cookie: "logged-in"
    });
    const openSpy = vi
      .spyOn(SyncStatusModal.prototype, "open")
      .mockImplementation(() => undefined);

    await plugin.onload();
    const command = plugin.__commands?.find(
      (candidate) => candidate.id === "xhs-vault-sync-status"
    );

    expect(command).toMatchObject({
      id: "xhs-vault-sync-status",
      name: "Show sync status"
    });
    command?.callback();
    expect(openSpy).toHaveBeenCalledTimes(1);
    openSpy.mockRestore();
  });

  it("登录命令通过插件公开方法打开登录窗口", async () => {
    const plugin = createPlugin();
    const openLoginModal = vi.fn();
    (
      plugin as unknown as {
        openLoginModal: () => void;
      }
    ).openLoginModal = openLoginModal;

    await plugin.onload();
    const command = plugin.__commands?.find(
      (candidate) => candidate.id === "xhs-vault-sync-login"
    );

    command?.callback();
    expect(openLoginModal).toHaveBeenCalledTimes(1);
  });

  it("首次加载未完成引导时延迟 500ms 打开新手引导", async () => {
    const plugin = createPlugin({
      ...createDefaultSettings(),
      hasSeenOnboarding: false
    });
    let scheduledCallback: (() => void) | undefined;
    const fakeWindow = {
      setTimeout: vi.fn((callback: () => void, delay: number) => {
        scheduledCallback = callback;
        return 456;
      })
    };
    vi.stubGlobal("window", fakeWindow);
    const openSpy = vi
      .spyOn(OnboardingModal.prototype, "open")
      .mockImplementation(() => undefined);

    await plugin.onload();

    expect(fakeWindow.setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
    expect(openSpy).not.toHaveBeenCalled();
    scheduledCallback?.();
    expect(openSpy).toHaveBeenCalledTimes(1);
    openSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("首次加载在测试环境无 window 时不会抛错", async () => {
    const plugin = createPlugin({
      ...createDefaultSettings(),
      hasSeenOnboarding: false
    });
    vi.stubGlobal("window", undefined);

    await expect(plugin.onload()).resolves.toBeUndefined();

    vi.unstubAllGlobals();
  });

  it("updateSyncStatus 合并上一状态、刷新状态栏、追加脱敏日志并保存", async () => {
    const plugin = createPlugin({
      ...createDefaultSettings(),
      a1Cookie: "logged-in",
      syncStatusSnapshot: {
        ...createIdleStatus(1000),
        discoveredCount: 4,
        savedCount: 1
      }
    });
    await plugin.onload();
    plugin.settings.syncStatusSnapshot = {
      ...plugin.settings.syncStatusSnapshot,
      discoveredCount: 4,
      savedCount: 1
    };

    await plugin.updateSyncStatus({
      phase: "saving",
      message: "正在保存 token=secret_token_value_123456",
      currentIndex: 2,
      totalCount: 4
    });

    expect(plugin.settings.syncStatusSnapshot).toMatchObject({
      phase: "saving",
      message: "正在保存 token=[redacted]",
      discoveredCount: 4,
      savedCount: 1,
      currentIndex: 2,
      totalCount: 4
    });
    expect(plugin.__statusBarItems?.[0].textContent).toBe("小红书：正在保存 2 / 4");
    expect(plugin.settings.syncLog.at(-1)).toMatchObject({
      phase: "saving",
      message: "正在保存 token=[redacted]"
    });
    expect(plugin.__savedData).toMatchObject({
      syncStatusSnapshot: expect.objectContaining({
        phase: "saving",
        message: "正在保存 token=[redacted]"
      }),
      syncLog: expect.arrayContaining([
        expect.objectContaining({
          phase: "saving",
          message: "正在保存 token=[redacted]"
        })
      ])
    });
  });

  it("loadSettings 合并旧设置时补齐新增状态字段", async () => {
    const plugin = createPlugin({
      rootFolder: "旧目录",
      cookies: "a1=old; web_session=secret",
      syncCursors: { bookmark: "cursor-1" },
      syncedIds: { note1: true },
      syncStatusSnapshot: {
        phase: "failed",
        message: "上次失败 token=secret_token_value_123456",
        updatedAt: 1234,
        lastError: "xsec_token=secret_xsec_value"
      },
      syncLog: [
        {
          time: 1,
          phase: "failed",
          message: "cookie=a1=secret_cookie_value"
        }
      ],
      lastSyncError: "Authorization: Bearer secret_bearer_value"
    });

    await plugin.loadSettings();

    expect(plugin.settings).toMatchObject({
      rootFolder: "旧目录",
      cookies: "",
      syncCursors: { bookmark: "cursor-1" },
      syncedIds: { note1: true },
      hasSeenOnboarding: false,
      syncLog: [
        {
          time: 1,
          phase: "failed",
          message: "cookie=[redacted]"
        }
      ],
      lastSyncError: "authorization: bearer [redacted]"
    });
    expect(plugin.settings.syncStatusSnapshot).toMatchObject({
      phase: "failed",
      message: "上次失败 token=[redacted]",
      updatedAt: 1234,
      discoveredCount: 0,
      savedCount: 0,
      skippedCount: 0,
      lastError: "xsec_token=[redacted]"
    });
  });

  it("syncNow 重复触发时只运行一个同步任务", async () => {
    let finishSync!: () => void;
    const syncBookmarks = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSync = resolve;
        })
    );
    const plugin = createPlugin({
      ...createDefaultSettings(),
      a1Cookie: "logged-in"
    });
    await plugin.onload();
    (
      plugin as unknown as {
        syncEngine: { syncBookmarks: () => Promise<void> };
      }
    ).syncEngine = { syncBookmarks };

    const firstSync = plugin.syncNow();
    const secondSync = plugin.syncNow();

    expect(syncBookmarks).toHaveBeenCalledTimes(1);
    await secondSync;
    finishSync();
    await firstSync;
  });

  it("卸载后状态更新不再保存数据", async () => {
    const plugin = createPlugin({
      ...createDefaultSettings(),
      a1Cookie: "logged-in"
    });
    await plugin.onload();
    vi.mocked(plugin.saveData).mockClear();
    const previousText = plugin.__statusBarItems?.[0].textContent;

    plugin.onunload();
    await plugin.updateSyncStatus({
      phase: "saving",
      message: "卸载后写入",
      currentIndex: 1,
      totalCount: 1
    });

    expect(plugin.saveData).not.toHaveBeenCalled();
    expect(plugin.__statusBarItems?.[0].textContent).toBe(previousText);
  });

  it("定时同步注册后会在卸载时清理", () => {
    const plugin = createPlugin({
      ...createDefaultSettings(),
      autoSyncEnabled: true,
      syncIntervalMinutes: 5
    });
    plugin.settings = {
      ...createDefaultSettings(),
      autoSyncEnabled: true,
      syncIntervalMinutes: 5
    };
    const fakeWindow = {
      setInterval: vi.fn(() => 123),
      clearInterval: vi.fn()
    };
    vi.stubGlobal("window", fakeWindow);

    plugin.startSyncInterval();
    plugin.onunload();

    expect(plugin.__registeredIntervals).toEqual([123]);
    expect(fakeWindow.clearInterval).toHaveBeenCalledWith(123);
    vi.unstubAllGlobals();
  });
});
