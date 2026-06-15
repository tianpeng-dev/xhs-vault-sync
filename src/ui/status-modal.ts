import { Modal } from "obsidian";
import type XhsVaultSyncPlugin from "../main";
import type { SyncTarget } from "../settings";
import { formatStatusLine, sanitizeStatusMessage } from "../sync/status";

const RAW_RESPONSE_PATTERN =
  /\s*\b(raw_response|rawResponse|originalResponse|原始响应)\b[\s\S]*$/i;

function formatOptionalTime(time: number, emptyText: string): string {
  return time ? new Date(time).toLocaleString() : emptyText;
}

function formatLogMessage(message: string): string {
  return sanitizeStatusMessage(message)
    .replace(RAW_RESPONSE_PATTERN, "[response redacted]")
    .trim();
}

function syncTargetLabel(target: SyncTarget): string {
  if (target === "post") return "我的笔记";
  if (target === "like") return "点赞";
  if (target === "album") return "专辑";
  return "收藏";
}

export class SyncStatusModal extends Modal {
  constructor(private readonly plugin: XhsVaultSyncPlugin) {
    super(plugin.app);
  }

  onOpen(): void {
    const { contentEl } = this;
    const { settings } = this.plugin;
    const status = settings.syncStatusSnapshot;
    const syncedCount = Object.keys(settings.syncedIds ?? {}).length;
    const debug = settings.lastBookmarkDebug;

    contentEl.empty();
    contentEl.createEl("h2", { text: "XHS Vault Sync 状态" });
    contentEl.createEl("p", { text: formatStatusLine(status) });
    contentEl.createEl("p", {
      text: `上次同步：${formatOptionalTime(settings.lastSyncAt, "暂无")}`
    });
    contentEl.createEl("p", {
      text: `当前账号：${settings.userName || settings.userId || "未识别"}`
    });
    contentEl.createEl("p", {
      text: `同步目标：${syncTargetLabel(settings.activeSyncTarget)}`
    });
    contentEl.createEl("p", {
      text: `进度：${status.currentIndex ?? 0} / ${status.totalCount ?? 0}`
    });
    contentEl.createEl("p", {
      text: `发现：${status.discoveredCount ?? 0} 条，保存：${status.savedCount ?? 0} 条，跳过：${status.skippedCount ?? 0} 条`
    });
    if (status.lastError || settings.lastSyncError) {
      contentEl.createEl("p", {
        text: `最近错误：${sanitizeStatusMessage(status.lastError || settings.lastSyncError)}`
      });
    }
    contentEl.createEl("p", { text: `已同步：${syncedCount} 条` });
    contentEl.createEl("p", { text: `保存目录：${settings.rootFolder}` });

    contentEl.createEl("h3", { text: "最近采集摘要" });
    if (debug) {
      contentEl.createEl("p", { text: `候选：${debug.noteCount} 条` });
      contentEl.createEl("p", {
        text: `来源：${debug.sourceSummary || "无"}`
      });
      contentEl.createEl("p", {
        text: `带访问令牌：${debug.tokenCount ?? 0} 条`
      });
    } else {
      contentEl.createEl("p", { text: "暂无采集摘要" });
    }

    contentEl.createEl("h3", { text: "最近日志" });
    const list = contentEl.createEl("ul");
    const recentLog = [...(settings.syncLog ?? [])].slice(-10).reverse();
    if (recentLog.length === 0) {
      list.createEl("li", { text: "暂无日志" });
      return;
    }

    for (const entry of recentLog) {
      list.createEl("li", {
        text: `${new Date(entry.time).toLocaleTimeString()} ${formatLogMessage(
          entry.message
        )}`
      });
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
