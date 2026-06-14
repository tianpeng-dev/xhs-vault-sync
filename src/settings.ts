import type { SyncLogEntry, SyncStatusSnapshot } from "./sync/status";
import { createIdleStatus } from "./sync/status";

export type SyncTarget = "bookmark";

export interface XhsVaultSyncSettings {
  rootFolder: string;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  syncBatchSize: number;
  activeSyncTarget: SyncTarget;
  downloadImages: boolean;
  cookies: string;
  a1Cookie: string;
  userId: string;
  userName: string;
  syncCursors: Record<string, string>;
  syncedIds: Record<string, true>;
  nextSyncIndex: number;
  lastSyncAt: number;
  hasSeenOnboarding: boolean;
  syncStatusSnapshot: SyncStatusSnapshot;
  syncLog: SyncLogEntry[];
  lastSyncError: string;
  lastBookmarkDebug?: {
    topLevelKeys: string[];
    dataKeys: string[];
    noteCount: number;
    hasMore: boolean;
    cursorPresent: boolean;
    codeType: string;
    codeValue?: string;
    messagePresent: boolean;
    messagePreview?: string;
    tokenCount?: number;
    sourceSummary?: string;
    itemKeySummary?: string;
    cardKeySummary?: string;
  };
}

export function createDefaultSettings(): XhsVaultSyncSettings {
  return {
    rootFolder: "RedNote",
    autoSyncEnabled: false,
    syncIntervalMinutes: 10,
    syncBatchSize: 5,
    activeSyncTarget: "bookmark",
    downloadImages: true,
    cookies: "",
    a1Cookie: "",
    userId: "",
    userName: "",
    syncCursors: {},
    syncedIds: {},
    nextSyncIndex: 1,
    lastSyncAt: 0,
    hasSeenOnboarding: false,
    syncStatusSnapshot: createIdleStatus(),
    syncLog: [],
    lastSyncError: "",
    lastBookmarkDebug: undefined
  };
}

export const DEFAULT_SETTINGS: XhsVaultSyncSettings = createDefaultSettings();
