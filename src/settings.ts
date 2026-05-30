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
  lastSyncAt: number;
}

export const DEFAULT_SETTINGS: XhsVaultSyncSettings = {
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
  lastSyncAt: 0
};
