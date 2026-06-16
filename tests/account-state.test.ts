import { describe, expect, it } from "vitest";
import { createDefaultSettings, type XhsVaultSyncSettings } from "../src/settings";
import {
  restoreAccountSyncState,
  snapshotAccountSyncState,
  switchAccountSyncState
} from "../src/sync/account-state";

describe("账号同步状态隔离", () => {
  it("只快照账号相关同步状态，不保存登录凭据", () => {
    const settings: XhsVaultSyncSettings = {
      ...createDefaultSettings(),
      cookies: "a1=secret; web_session=secret",
      a1Cookie: "a1-secret",
      syncCursors: { bookmark: "cursor-a" },
      syncedIds: { note1: true },
      allSynced: { bookmark: true },
      albumWhitelist: { "album-a": true },
      lastAlbumSnapshot: [{ id: "album-a", title: "旅行", noteCount: 2 }],
      bookmarkCateNextCursor: { "album-a": "album-cursor" },
      cateSyncAllBookmark: { "album-a": true },
      nextSyncIndex: 9
    };

    const snapshot = snapshotAccountSyncState(settings);

    expect(snapshot).toEqual({
      syncCursors: { bookmark: "cursor-a" },
      syncedIds: { note1: true },
      allSynced: { bookmark: true },
      albumWhitelist: { "album-a": true },
      lastAlbumSnapshot: [{ id: "album-a", title: "旅行", noteCount: 2 }],
      bookmarkCateNextCursor: { "album-a": "album-cursor" },
      cateSyncAllBookmark: { "album-a": true },
      nextSyncIndex: 9
    });
    expect(JSON.stringify(snapshot)).not.toContain("secret");
  });

  it("切换账号时保存旧账号状态并恢复新账号状态", () => {
    const settings: XhsVaultSyncSettings = {
      ...createDefaultSettings(),
      userId: "user-a",
      userName: "账号A",
      syncCursors: { bookmark: "cursor-a" },
      syncedIds: { "post:note-a": true },
      nextSyncIndex: 4,
      perAccountState: {
        "user-b": {
          syncCursors: { like: "cursor-b" },
          syncedIds: { "like:note-b": true },
          allSynced: { like: true },
          albumWhitelist: { "album-b": true },
          lastAlbumSnapshot: [{ id: "album-b", title: "食谱" }],
          bookmarkCateNextCursor: { "album-b": "album-b-cursor" },
          cateSyncAllBookmark: { "album-b": false },
          nextSyncIndex: 12
        }
      }
    };

    switchAccountSyncState(settings, { userId: "user-b", userName: "账号B" });

    expect(settings.perAccountState["user-a"]).toMatchObject({
      syncCursors: { bookmark: "cursor-a" },
      syncedIds: { "post:note-a": true },
      nextSyncIndex: 4
    });
    expect(settings).toMatchObject({
      userId: "user-b",
      userName: "账号B",
      syncCursors: { like: "cursor-b" },
      syncedIds: { "like:note-b": true },
      allSynced: { like: true },
      albumWhitelist: { "album-b": true },
      lastAlbumSnapshot: [{ id: "album-b", title: "食谱" }],
      bookmarkCateNextCursor: { "album-b": "album-b-cursor" },
      cateSyncAllBookmark: { "album-b": false },
      nextSyncIndex: 12
    });
  });

  it("切换到没有历史的新账号时清空账号相关状态", () => {
    const settings: XhsVaultSyncSettings = {
      ...createDefaultSettings(),
      userId: "user-a",
      syncCursors: { bookmark: "cursor-a" },
      syncedIds: { note1: true },
      albumWhitelist: { "album-a": true },
      lastAlbumSnapshot: [{ id: "album-a", title: "旅行" }],
      bookmarkCateNextCursor: { "album-a": "cursor" },
      cateSyncAllBookmark: { "album-a": true },
      nextSyncIndex: 7
    };

    switchAccountSyncState(settings, { userId: "user-c", userName: "账号C" });

    expect(settings.perAccountState["user-a"].syncedIds).toEqual({ note1: true });
    expect(settings).toMatchObject({
      userId: "user-c",
      userName: "账号C",
      syncCursors: {},
      syncedIds: {},
      allSynced: {},
      albumWhitelist: {},
      lastAlbumSnapshot: [],
      bookmarkCateNextCursor: {},
      cateSyncAllBookmark: {},
      nextSyncIndex: 1
    });
  });

  it("恢复空状态时使用默认账号状态", () => {
    const settings: XhsVaultSyncSettings = {
      ...createDefaultSettings(),
      syncCursors: { bookmark: "cursor-a" },
      syncedIds: { note1: true },
      nextSyncIndex: 6
    };

    restoreAccountSyncState(settings, undefined);

    expect(settings.syncCursors).toEqual({});
    expect(settings.syncedIds).toEqual({});
    expect(settings.nextSyncIndex).toBe(1);
  });
});
