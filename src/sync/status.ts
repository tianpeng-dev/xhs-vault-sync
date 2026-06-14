export type SyncPhase =
  | "not_logged_in"
  | "idle"
  | "opening_xhs"
  | "collecting"
  | "saving"
  | "complete"
  | "failed";

export interface SyncStatusSnapshot {
  phase: SyncPhase;
  message: string;
  startedAt?: number;
  updatedAt: number;
  discoveredCount: number;
  savedCount: number;
  skippedCount: number;
  currentIndex?: number;
  totalCount?: number;
  lastError?: string;
}

export interface SyncLogEntry {
  time: number;
  phase: SyncPhase;
  message: string;
}

const MAX_SYNC_LOG_ENTRIES = 50;
const SENSITIVE_ASSIGNMENT_PATTERN =
  /\b(cookie|token|xsec|xsec_token|a1|web_session|id_token)\s*=\s*[^\s&]+/gi;
const SENSITIVE_COLON_PATTERN =
  /(["']?\b(cookie|token|xsec|xsec_token|a1|web_session|id_token)\b["']?\s*:\s*)["']?[^"',\s}]+["']?/gi;
const AUTHORIZATION_PATTERN = /\bauthorization\s*:\s*bearer\s+[^\s,}]+/gi;

export function createIdleStatus(now = 0): SyncStatusSnapshot {
  return {
    phase: "idle",
    message: "等待同步",
    updatedAt: now,
    discoveredCount: 0,
    savedCount: 0,
    skippedCount: 0
  };
}

export function sanitizeStatusMessage(message: string): string {
  return message
    .replace(
      SENSITIVE_ASSIGNMENT_PATTERN,
      (_matched, key: string) => `${key}=[redacted]`
    )
    .replace(SENSITIVE_COLON_PATTERN, (_matched, prefix: string) => {
      const needsQuote = prefix.trimStart().startsWith('"');
      return `${prefix}${needsQuote ? '"[redacted]"' : "[redacted]"}`;
    })
    .replace(AUTHORIZATION_PATTERN, "authorization: bearer [redacted]");
}

export function appendSyncLog(
  log: SyncLogEntry[],
  entry: SyncLogEntry
): SyncLogEntry[] {
  return [
    ...log,
    {
      ...entry,
      message: sanitizeStatusMessage(entry.message)
    }
  ].slice(-MAX_SYNC_LOG_ENTRIES);
}

export function formatStatusLine(status: SyncStatusSnapshot): string {
  const safeMessage = sanitizeStatusMessage(status.message || "等待同步");

  switch (status.phase) {
    case "not_logged_in":
      return "小红书：未登录";
    case "idle":
      return `小红书：${safeMessage}`;
    case "opening_xhs":
      return "小红书：正在打开小红书";
    case "collecting":
      return `小红书：正在读取收藏（已发现 ${status.discoveredCount} 条）`;
    case "saving":
      return `小红书：正在保存 ${status.currentIndex ?? status.savedCount} / ${
        status.totalCount ?? status.discoveredCount
      }`;
    case "complete":
      return `小红书：同步完成（已保存 ${status.savedCount} 条，已跳过 ${status.skippedCount} 条）`;
    case "failed":
      return `小红书：同步失败：${sanitizeStatusMessage(
        status.lastError || status.message || "未知错误"
      )}`;
  }
}
