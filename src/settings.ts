import type { SyncLogEntry, SyncStatusSnapshot } from "./sync/status";
import { createIdleStatus } from "./sync/status";
import type { XhsAlbum } from "./sync/types";

export type SyncTarget = "bookmark" | "post" | "like" | "album";

export interface AccountSyncState {
  syncCursors: Record<string, string>;
  syncedIds: Record<string, true>;
  allSynced: Record<string, boolean>;
  albumWhitelist: Record<string, true>;
  lastAlbumSnapshot: XhsAlbum[];
  bookmarkCateNextCursor: Record<string, string>;
  cateSyncAllBookmark: Record<string, boolean>;
  nextSyncIndex: number;
}

export interface XhsVaultSyncSettings {
  rootFolder: string;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  syncBatchSize: number;
  activeSyncTarget: SyncTarget;
  syncTargets: SyncTarget[];
  downloadImages: boolean;
  downloadVideos: boolean;
  cookies: string;
  a1Cookie: string;
  userId: string;
  userName: string;
  syncCursors: Record<string, string>;
  syncedIds: Record<string, true>;
  allSynced: Record<string, boolean>;
  albumWhitelist: Record<string, true>;
  lastAlbumSnapshot: XhsAlbum[];
  bookmarkCateNextCursor: Record<string, string>;
  cateSyncAllBookmark: Record<string, boolean>;
  perAccountState: Record<string, AccountSyncState>;
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
    syncTargets: ["bookmark"],
    downloadImages: true,
    downloadVideos: false,
    cookies: "",
    a1Cookie: "",
    userId: "",
    userName: "",
    syncCursors: {},
    syncedIds: {},
    allSynced: {},
    albumWhitelist: {},
    lastAlbumSnapshot: [],
    bookmarkCateNextCursor: {},
    cateSyncAllBookmark: {},
    perAccountState: {},
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
