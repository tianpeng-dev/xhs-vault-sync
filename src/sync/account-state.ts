import type { AccountSyncState, XhsVaultSyncSettings } from "../settings";

export function createEmptyAccountSyncState(): AccountSyncState {
  return {
    syncCursors: {},
    syncedIds: {},
    allSynced: {},
    albumWhitelist: {},
    lastAlbumSnapshot: [],
    bookmarkCateNextCursor: {},
    cateSyncAllBookmark: {},
    nextSyncIndex: 1
  };
}

export function snapshotAccountSyncState(settings: XhsVaultSyncSettings): AccountSyncState {
  return {
    syncCursors: { ...settings.syncCursors },
    syncedIds: { ...settings.syncedIds },
    allSynced: { ...settings.allSynced },
    albumWhitelist: { ...settings.albumWhitelist },
    lastAlbumSnapshot: [...settings.lastAlbumSnapshot],
    bookmarkCateNextCursor: { ...settings.bookmarkCateNextCursor },
    cateSyncAllBookmark: { ...settings.cateSyncAllBookmark },
    nextSyncIndex: settings.nextSyncIndex ?? 1
  };
}

export function restoreAccountSyncState(
  settings: XhsVaultSyncSettings,
  state: AccountSyncState | undefined
): void {
  const next = state ?? createEmptyAccountSyncState();
  settings.syncCursors = { ...next.syncCursors };
  settings.syncedIds = { ...next.syncedIds };
  settings.allSynced = { ...next.allSynced };
  settings.albumWhitelist = { ...next.albumWhitelist };
  settings.lastAlbumSnapshot = [...next.lastAlbumSnapshot];
  settings.bookmarkCateNextCursor = { ...next.bookmarkCateNextCursor };
  settings.cateSyncAllBookmark = { ...next.cateSyncAllBookmark };
  settings.nextSyncIndex = next.nextSyncIndex ?? 1;
}

export function switchAccountSyncState(
  settings: XhsVaultSyncSettings,
  user: { userId: string; userName: string }
): void {
  const previousUserId = settings.userId;
  if (!previousUserId) {
    const savedState = settings.perAccountState[user.userId];
    if (savedState) restoreAccountSyncState(settings, savedState);
    settings.userId = user.userId;
    settings.userName = user.userName;
    return;
  }

  if (previousUserId && previousUserId !== user.userId) {
    settings.perAccountState[previousUserId] = snapshotAccountSyncState(settings);
  }

  if (previousUserId !== user.userId) {
    restoreAccountSyncState(settings, settings.perAccountState[user.userId]);
  }

  settings.userId = user.userId;
  settings.userName = user.userName;
}
