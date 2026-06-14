import { beforeEach, describe, expect, it, vi } from "vitest";
import { createIdleStatus, formatStatusLine } from "../src/sync/status";
import {
  markNoteSynced,
  shouldSyncNote,
  SyncEngine,
  userFacingSyncError
} from "../src/sync/sync-engine";

const syncEngineMocks = vi.hoisted(() => {
  const signer = {
    initWebview: vi.fn(),
    collectBookmarks: vi.fn(),
    collectNoteDetail: vi.fn(),
    destroy: vi.fn()
  };
  const api = {
    getCurrentUser: vi.fn(),
    getBookmarks: vi.fn(),
    getNoteDetail: vi.fn()
  };
  const writer = {
    writeNote: vi.fn(),
    writeMedia: vi.fn()
  };

  return {
    signer,
    api,
    writer,
    readXhsCookieHeader: vi.fn()
  };
});

vi.mock("../src/xhs/sign-manager", () => ({
  SignManager: vi.fn(function SignManager() {
    return syncEngineMocks.signer;
  })
}));

vi.mock("../src/xhs/api", () => ({
  XhsApi: vi.fn(function XhsApi() {
    return syncEngineMocks.api;
  })
}));

vi.mock("../src/vault/vault-writer", () => ({
  VaultWriter: vi.fn(function VaultWriter() {
    return syncEngineMocks.writer;
  })
}));

vi.mock("../src/xhs/cookies", () => ({
  readXhsCookieHeader: syncEngineMocks.readXhsCookieHeader
}));

describe("sync state helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    syncEngineMocks.readXhsCookieHeader.mockResolvedValue("a1=session");
    syncEngineMocks.signer.initWebview.mockResolvedValue(undefined);
    syncEngineMocks.signer.collectNoteDetail.mockResolvedValue(null);
    syncEngineMocks.signer.collectBookmarks.mockResolvedValue({
      notes: [
        { noteId: "note1", xsecToken: "token1" },
        { noteId: "note2", xsecToken: "token2" },
        { noteId: "note3", xsecToken: "token3" }
      ],
      cursor: "next-cursor",
      hasMore: false,
      debug: {
        topLevelKeys: [],
        dataKeys: [],
        noteCount: 3,
        hasMore: false,
        cursorPresent: true,
        codeType: "undefined",
        messagePresent: false
      }
    });
    syncEngineMocks.api.getCurrentUser.mockResolvedValue({
      userId: "user1",
      userName: "用户"
    });
    syncEngineMocks.api.getBookmarks.mockResolvedValue({
      notes: [
        { noteId: "note1", xsecToken: "token1" },
        { noteId: "note2", xsecToken: "token2" },
        { noteId: "note3", xsecToken: "token3" }
      ],
      cursor: "next-cursor",
      hasMore: false,
      debug: {
        topLevelKeys: ["data"],
        dataKeys: ["notes"],
        noteCount: 3,
        hasMore: false,
        cursorPresent: true,
        codeType: "undefined",
        messagePresent: false
      }
    });
    syncEngineMocks.api.getNoteDetail.mockImplementation((noteId: string) =>
      Promise.resolve({
        id: noteId,
        title: noteId,
        author: "",
        url: `https://example.com/${noteId}`,
        tags: [],
        content: "",
        media: [],
        comments: []
      })
    );
    syncEngineMocks.writer.writeNote.mockResolvedValue(undefined);
    syncEngineMocks.writer.writeMedia.mockResolvedValue("media-path");
  });

  it("skips already synced note ids", () => {
    expect(shouldSyncNote({ note1: true }, "note1")).toBe(false);
    expect(shouldSyncNote({ note1: true }, "note2")).toBe(true);
  });

  it("marks a note id as synced", () => {
    const state: Record<string, true> = {};
    markNoteSynced(state, "note1");
    expect(state).toEqual({ note1: true });
  });

  it("formats saving progress for sync engine updates", () => {
    const line = formatStatusLine({
      ...createIdleStatus(1000),
      phase: "saving",
      message: "正在保存",
      currentIndex: 3,
      totalCount: 5
    });

    expect(line).toBe("小红书：正在保存 3 / 5");
  });

  it("reports sync engine phases with discovered saved skipped and progress counts", async () => {
    const plugin = createPluginHarness();
    const engine = new SyncEngine(plugin);

    await engine.syncBookmarks();

    expect(plugin.updateSyncStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "opening_xhs",
        discoveredCount: 0,
        savedCount: 0,
        skippedCount: 0
      })
    );
    expect(plugin.updateSyncStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "collecting",
        discoveredCount: 0,
        savedCount: 0,
        skippedCount: 0
      })
    );
    expect(plugin.updateSyncStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "saving",
        discoveredCount: 3,
        savedCount: 0,
        skippedCount: 0,
        currentIndex: 0,
        totalCount: 2
      })
    );
    expect(plugin.updateSyncStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "saving",
        discoveredCount: 3,
        savedCount: 1,
        skippedCount: 1,
        currentIndex: 2,
        totalCount: 2
      })
    );
    expect(plugin.updateSyncStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "complete",
        discoveredCount: 3,
        savedCount: 2,
        skippedCount: 1
      })
    );
    expect(plugin.settings.syncedIds).toEqual({
      note1: true,
      note2: true,
      note3: true
    });
  });

  it("stores user-facing sync error while reporting failed status", async () => {
    const plugin = createPluginHarness();
    const engine = new SyncEngine(plugin);
    syncEngineMocks.api.getCurrentUser.mockRejectedValue(new Error("Not logged in"));

    await expect(engine.syncBookmarks()).rejects.toThrow("Not logged in");

    expect(plugin.settings.lastSyncError).toBe("登录已失效，请重新登录小红书");
    expect(plugin.updateSyncStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "failed",
        message: "登录已失效，请重新登录小红书",
        lastError: "登录已失效，请重新登录小红书"
      })
    );
  });

  it("does not persist full cookie header after merging HttpOnly cookies", async () => {
    const plugin = createPluginHarness({ cookies: "a1=old; web_session=old_secret" });
    const engine = new SyncEngine(plugin);
    syncEngineMocks.readXhsCookieHeader.mockResolvedValue(
      "a1=session; web_session=secret_session"
    );

    await engine.syncBookmarks();

    expect(plugin.settings.cookies).toBe("");
  });

  it("does not advance cursor when batch limit leaves current page items unprocessed", async () => {
    const plugin = createPluginHarness({ syncedIds: {} });
    const engine = new SyncEngine(plugin);

    await engine.syncBookmarks();

    expect(syncEngineMocks.writer.writeNote).toHaveBeenCalledTimes(2);
    expect(plugin.settings.syncCursors.bookmark).toBeUndefined();
  });

  it("uses page detail content when feed detail is empty", async () => {
    const plugin = createPluginHarness({ syncedIds: {}, syncBatchSize: 1 });
    const engine = new SyncEngine(plugin);
    syncEngineMocks.api.getNoteDetail.mockResolvedValue(null);
    syncEngineMocks.signer.collectNoteDetail.mockResolvedValue({
      id: "note1",
      title: "页面标题",
      author: "页面作者",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: ["xhs", "xhs-bookmark"],
      content: "这是真实的小红书正文",
      media: [],
      comments: []
    });

    await engine.syncBookmarks();

    expect(syncEngineMocks.signer.collectNoteDetail).toHaveBeenCalledWith({
      noteId: "note1",
      xsecToken: "token1"
    });
    expect(syncEngineMocks.writer.writeNote).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "note1",
        title: "页面标题",
        content: "这是真实的小红书正文"
      })
    );
    expect(syncEngineMocks.writer.writeNote).not.toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("当前 Web 详情接口未返回完整正文")
      })
    );
  });

  it("uses API bookmark ids as the source of truth so image notes missing from the visible page are synced", async () => {
    const plugin = createPluginHarness({ syncedIds: {}, syncBatchSize: 2 });
    const engine = new SyncEngine(plugin);
    syncEngineMocks.api.getBookmarks.mockResolvedValue({
      notes: [
        { noteId: "image-note", xsecToken: "image-token" },
        { noteId: "video-note", xsecToken: "video-token" }
      ],
      cursor: "api-cursor",
      hasMore: false,
      debug: {
        topLevelKeys: ["data"],
        dataKeys: ["notes"],
        noteCount: 2,
        hasMore: false,
        cursorPresent: true,
        codeType: "undefined",
        messagePresent: false
      }
    });
    syncEngineMocks.signer.collectBookmarks.mockResolvedValue({
      notes: [
        {
          noteId: "video-note",
          xsecToken: "video-token",
          title: "页面上可见的视频",
          noteType: "video"
        }
      ],
      cursor: "",
      hasMore: false,
      debug: {
        topLevelKeys: ["page-collector"],
        dataKeys: ["dom"],
        noteCount: 1,
        hasMore: false,
        cursorPresent: false,
        codeType: "page-collector",
        messagePresent: false
      }
    });
    syncEngineMocks.api.getNoteDetail.mockImplementation((noteId: string) =>
      Promise.resolve({
        id: noteId,
        title: noteId === "image-note" ? "图文笔记" : "视频笔记",
        author: "",
        url: `https://example.com/${noteId}`,
        tags: [],
        content: noteId === "image-note" ? "图文正文" : "视频正文",
        media: noteId === "image-note"
          ? [
              { type: "image", url: "https://img.example.com/1.jpg" },
              { type: "image", url: "https://img.example.com/2.jpg" }
            ]
          : [],
        comments: []
      })
    );

    await engine.syncBookmarks();

    expect(syncEngineMocks.api.getBookmarks).toHaveBeenCalledWith("user1", "", 30);
    expect(syncEngineMocks.api.getNoteDetail).toHaveBeenCalledWith("image-note", "image-token");
    expect(syncEngineMocks.writer.writeNote).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "image-note",
        title: "图文笔记",
        content: "图文正文",
        media: [
          { type: "image", url: "https://img.example.com/1.jpg" },
          { type: "image", url: "https://img.example.com/2.jpg" }
        ]
      })
    );
  });

  it("continues with API bookmarks when visible page collection fails", async () => {
    const plugin = createPluginHarness({ syncedIds: {}, syncBatchSize: 1 });
    const engine = new SyncEngine(plugin);
    syncEngineMocks.signer.collectBookmarks.mockRejectedValue(new Error("page collector failed"));
    syncEngineMocks.api.getBookmarks.mockResolvedValue({
      notes: [{ noteId: "image-note", xsecToken: "image-token" }],
      cursor: "api-cursor",
      hasMore: false,
      debug: {
        topLevelKeys: ["data"],
        dataKeys: ["notes"],
        noteCount: 1,
        hasMore: false,
        cursorPresent: true,
        codeType: "undefined",
        messagePresent: false
      }
    });
    syncEngineMocks.api.getNoteDetail.mockResolvedValue({
      id: "image-note",
      title: "图文笔记",
      author: "",
      url: "https://example.com/image-note",
      tags: [],
      content: "图文正文",
      media: [{ type: "image", url: "https://img.example.com/1.jpg" }],
      comments: []
    });

    await engine.syncBookmarks();

    expect(syncEngineMocks.writer.writeNote).toHaveBeenCalledWith(
      expect.objectContaining({ id: "image-note", content: "图文正文" })
    );
  });

  it("continues with visible page bookmarks when bookmark API reports account abnormal", async () => {
    const plugin = createPluginHarness({ syncedIds: {}, syncBatchSize: 1 });
    const engine = new SyncEngine(plugin);
    syncEngineMocks.api.getBookmarks.mockRejectedValue(
      new Error("XHS bookmark API rejected: Account abnormal. Switch account and retry.")
    );
    syncEngineMocks.signer.collectBookmarks.mockResolvedValue({
      notes: [
        {
          noteId: "page-note",
          xsecToken: "page-token",
          title: "页面采集图文",
          coverUrl: "https://img.example.com/page.jpg"
        }
      ],
      cursor: "",
      hasMore: false,
      debug: {
        topLevelKeys: ["page-collector"],
        dataKeys: ["dom"],
        noteCount: 1,
        hasMore: false,
        cursorPresent: false,
        codeType: "page-collector",
        messagePresent: false
      }
    });
    syncEngineMocks.api.getNoteDetail.mockResolvedValue(null);
    syncEngineMocks.signer.collectNoteDetail.mockResolvedValue({
      id: "page-note",
      title: "页面采集图文",
      author: "作者",
      url: "https://www.xiaohongshu.com/explore/page-note",
      tags: ["xhs"],
      content: "页面采集正文",
      media: [{ type: "image", url: "https://img.example.com/page.jpg" }],
      comments: []
    });

    await engine.syncBookmarks();

    expect(syncEngineMocks.signer.collectBookmarks).toHaveBeenCalledWith("user1", 30);
    expect(syncEngineMocks.writer.writeNote).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "page-note",
        title: "页面采集图文",
        content: "页面采集正文"
      })
    );
    expect(plugin.settings.syncedIds).toEqual({ "page-note": true });
  });

  it("skips visible page error candidates without consuming sync index", async () => {
    const plugin = createPluginHarness({ syncedIds: {}, syncBatchSize: 1, nextSyncIndex: 7 });
    const engine = new SyncEngine(plugin);
    syncEngineMocks.api.getBookmarks.mockRejectedValue(
      new Error("XHS bookmark API rejected: Account abnormal. Switch account and retry.")
    );
    syncEngineMocks.signer.collectBookmarks.mockResolvedValue({
      notes: [
        {
          noteId: "missing-note",
          xsecToken: "",
          title: "Sorry, This Page Isn't Available Right Now.",
          coverUrl: "https://img.example.com/error.jpg"
        }
      ],
      cursor: "",
      hasMore: false,
      debug: {
        topLevelKeys: ["page-collector"],
        dataKeys: ["dom"],
        noteCount: 1,
        hasMore: false,
        cursorPresent: false,
        codeType: "page-collector",
        messagePresent: false
      }
    });
    syncEngineMocks.api.getNoteDetail.mockResolvedValue(null);
    syncEngineMocks.signer.collectNoteDetail.mockResolvedValue(null);

    await engine.syncBookmarks();

    expect(syncEngineMocks.writer.writeNote).not.toHaveBeenCalled();
    expect(plugin.settings.syncedIds).toEqual({});
    expect(plugin.settings.nextSyncIndex).toBe(7);
  });

  it("skips unavailable detail pages even when the error page exposes media", async () => {
    const plugin = createPluginHarness({ syncedIds: {}, syncBatchSize: 1, nextSyncIndex: 7 });
    const engine = new SyncEngine(plugin);
    syncEngineMocks.api.getBookmarks.mockRejectedValue(
      new Error("XHS bookmark API rejected: Account abnormal. Switch account and retry.")
    );
    syncEngineMocks.signer.collectBookmarks.mockResolvedValue({
      notes: [
        {
          noteId: "missing-note",
          xsecToken: "",
          title: "收藏列表标题",
          coverUrl: "https://img.example.com/error.jpg"
        }
      ],
      cursor: "",
      hasMore: false,
      debug: {
        topLevelKeys: ["page-collector"],
        dataKeys: ["dom"],
        noteCount: 1,
        hasMore: false,
        cursorPresent: false,
        codeType: "page-collector",
        messagePresent: false
      }
    });
    syncEngineMocks.api.getNoteDetail.mockResolvedValue(null);
    syncEngineMocks.signer.collectNoteDetail.mockResolvedValue({
      id: "missing-note",
      title: "Sorry, This Page Isn't Available Right Now.",
      author: "",
      url: "https://www.xiaohongshu.com/explore/missing-note",
      tags: ["xhs", "xhs-bookmark"],
      content: "",
      media: [{ type: "image", url: "https://img.example.com/error.jpg" }],
      comments: []
    });

    await engine.syncBookmarks();

    expect(syncEngineMocks.writer.writeNote).not.toHaveBeenCalled();
    expect(plugin.settings.syncedIds).toEqual({});
    expect(plugin.settings.nextSyncIndex).toBe(7);
  });

  it("assigns stable increasing sync indexes only to newly saved notes", async () => {
    const plugin = createPluginHarness({
      syncedIds: { note1: true },
      syncBatchSize: 2,
      nextSyncIndex: 7
    });
    const engine = new SyncEngine(plugin);

    await engine.syncBookmarks();

    expect(syncEngineMocks.writer.writeNote).toHaveBeenCalledTimes(2);
    expect(syncEngineMocks.writer.writeNote).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        id: "note2",
        syncIndex: 7,
        syncedAt: expect.any(String)
      })
    );
    expect(syncEngineMocks.writer.writeNote).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        id: "note3",
        syncIndex: 8,
        syncedAt: expect.any(String)
      })
    );
    expect(plugin.settings.nextSyncIndex).toBe(9);
  });

  it("does not consume sync index when writing a new note fails", async () => {
    const plugin = createPluginHarness({
      syncedIds: {},
      syncBatchSize: 1,
      nextSyncIndex: 7
    });
    const engine = new SyncEngine(plugin);
    syncEngineMocks.writer.writeNote.mockRejectedValue(new Error("write failed"));

    await expect(engine.syncBookmarks()).rejects.toThrow("write failed");

    expect(syncEngineMocks.writer.writeNote).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "note1",
        syncIndex: 7
      })
    );
    expect(plugin.settings.nextSyncIndex).toBe(7);
    expect(plugin.settings.syncedIds.note1).toBeUndefined();
  });

  it("keeps only WenYiWen answers from comments collected on the note page", async () => {
    const plugin = createPluginHarness({ syncedIds: {}, syncBatchSize: 1 });
    const engine = new SyncEngine(plugin);
    syncEngineMocks.api.getNoteDetail.mockResolvedValue({
      id: "note1",
      title: "接口标题",
      author: "接口作者",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: ["xhs"],
      content: "接口正文",
      media: [{ type: "image", url: "https://img.example.com/1.jpg" }],
      comments: [{ author: "普通用户", content: "接口普通评论" }]
    });
    syncEngineMocks.signer.collectNoteDetail.mockResolvedValue({
      id: "note1",
      title: "页面标题",
      author: "页面作者",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: ["xhs", "xhs-bookmark"],
      content: "页面正文",
      media: [{ type: "image", url: "https://img.example.com/1.jpg" }],
      comments: [
        { author: "小红薯555", content: "@问一问 总结视频内容" },
        { author: "问一问", content: "这是问一问回答" },
        { author: "普通用户", content: "普通评论" }
      ]
    });

    await engine.syncBookmarks();

    expect(syncEngineMocks.signer.collectNoteDetail).toHaveBeenCalled();
    expect(syncEngineMocks.writer.writeNote).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "note1",
        content: "页面正文",
        comments: [{ author: "问一问", content: "这是问一问回答" }]
      })
    );
  });

  it("redacts unknown raw sync errors before storing status", async () => {
    const plugin = createPluginHarness();
    const engine = new SyncEngine(plugin);
    syncEngineMocks.api.getCurrentUser.mockRejectedValue(
      new Error("HTTP 500 token=secret_token_value_123456")
    );

    await expect(engine.syncBookmarks()).rejects.toThrow("HTTP 500");

    expect(plugin.settings.lastSyncError).toBe("HTTP 500 token=[redacted]");
    expect(plugin.updateSyncStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        phase: "failed",
        message: "HTTP 500 token=[redacted]",
        lastError: "HTTP 500 token=[redacted]"
      })
    );
  });

  it("maps known sync errors to user-facing Chinese messages", () => {
    expect(userFacingSyncError("Not logged in")).toBe("登录已失效，请重新登录小红书");
    expect(userFacingSyncError("Webview load timeout")).toBe(
      "小红书页面加载超时，请稍后重试"
    );
    expect(userFacingSyncError("HTTP 406")).toBe(
      "小红书拒绝了当前请求，请重新登录后再试"
    );
    expect(userFacingSyncError("其他错误")).toBe("其他错误");
  });
});

function createPluginHarness(overrides: Partial<{
  cookies: string;
  syncedIds: Record<string, true>;
  syncBatchSize: number;
  nextSyncIndex: number;
}> = {}) {
  const settings = {
    a1Cookie: "session",
    cookies: overrides.cookies ?? "",
    userId: "",
    userName: "",
    syncCursors: {},
    syncedIds: overrides.syncedIds ?? ({ note1: true } as Record<string, true>),
    allSynced: {},
    albumWhitelist: {},
    bookmarkCateNextCursor: {},
    cateSyncAllBookmark: {},
    perAccountState: {},
    nextSyncIndex: overrides.nextSyncIndex ?? 1,
    activeSyncTarget: "bookmark" as const,
    syncTargets: ["bookmark" as const],
    syncBatchSize: overrides.syncBatchSize ?? 2,
    downloadImages: false,
    downloadVideos: false,
    rootFolder: "RedNote",
    lastSyncAt: 0,
    lastSyncError: "",
    syncStatusSnapshot: createIdleStatus(1000),
    syncLog: [],
    autoSyncEnabled: false,
    syncIntervalMinutes: 30,
    hasSeenOnboarding: false
  };
  const plugin = {
    app: {},
    settings,
    saveSettings: vi.fn(async () => undefined),
    updateSyncStatus: vi.fn(async (partial) => {
      settings.syncStatusSnapshot = {
        ...settings.syncStatusSnapshot,
        ...partial,
        updatedAt: Date.now()
      };
    })
  };

  return plugin as unknown as ConstructorParameters<typeof SyncEngine>[0];
}
