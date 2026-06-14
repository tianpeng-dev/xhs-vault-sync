import { Notice } from "obsidian";
import type XhsVaultSyncPlugin from "../main";
import type { BookmarkPage, XhsComment, XhsNote } from "./types";
import { VaultWriter } from "../vault/vault-writer";
import { XhsApi } from "../xhs/api";
import { readXhsCookieHeader } from "../xhs/cookies";
import { SignManager } from "../xhs/sign-manager";
import { downloadMedia } from "./media-downloader";
import { sanitizeStatusMessage } from "./status";

export function shouldSyncNote(syncedIds: Record<string, true>, noteId: string): boolean {
  return syncedIds[noteId] !== true;
}

export function markNoteSynced(syncedIds: Record<string, true>, noteId: string): void {
  syncedIds[noteId] = true;
}

export class SyncEngine {
  private isSyncing = false;

  constructor(private readonly plugin: XhsVaultSyncPlugin) {}

  async syncBookmarks(): Promise<void> {
    if (this.isSyncing) {
      new Notice("XHS sync is already running.");
      return;
    }

    this.isSyncing = true;
    const signer = new SignManager();

    try {
      await this.plugin.updateSyncStatus({
        phase: "opening_xhs",
        message: "正在打开小红书页面",
        startedAt: Date.now(),
        discoveredCount: 0,
        savedCount: 0,
        skippedCount: 0
      });

      await signer.initWebview();
      const visibleCookies = `a1=${this.plugin.settings.a1Cookie}`;
      const cookies = await readXhsCookieHeader(visibleCookies);
      this.plugin.settings.cookies = "";
      const api = new XhsApi(signer, cookies);
      const writer = new VaultWriter(this.plugin.app, this.plugin.settings.rootFolder);
      const user = await api.getCurrentUser();
      this.plugin.settings.userId = user.userId;
      this.plugin.settings.userName = user.userName;

      await this.plugin.updateSyncStatus({
        phase: "collecting",
        message: "正在读取收藏",
        discoveredCount: 0,
        savedCount: 0,
        skippedCount: 0
      });

      const pageSize = Math.max(30, this.plugin.settings.syncBatchSize);
      const apiPage = await collectApiBookmarksSafely(
        api,
        user.userId,
        this.plugin.settings.syncCursors.bookmark ?? "",
        pageSize
      );
      const collectedPage = await collectVisibleBookmarksSafely(signer, user.userId, pageSize);
      const page = mergeBookmarkPages(apiPage, collectedPage);
      this.plugin.settings.lastBookmarkDebug = page.debug;
      let saved = 0;
      let skipped = 0;
      let processed = 0;
      let reachedBatchLimit = false;
      const totalCount = Math.min(page.notes.length, this.plugin.settings.syncBatchSize);

      await this.plugin.updateSyncStatus({
        phase: "saving",
        message: "正在保存",
        discoveredCount: page.notes.length,
        savedCount: saved,
        skippedCount: skipped,
        currentIndex: processed,
        totalCount
      });

      for (const item of page.notes) {
        if (!shouldSyncNote(this.plugin.settings.syncedIds, item.noteId)) {
          skipped++;
          continue;
        }
        processed++;
        await this.plugin.updateSyncStatus({
          phase: "saving",
          message: "正在保存",
          discoveredCount: page.notes.length,
          savedCount: saved,
          skippedCount: skipped,
          currentIndex: processed,
          totalCount
        });

        const apiDetail = await api.getNoteDetail(item.noteId, item.xsecToken);
        const rawPageDetail = shouldCollectPageDetail(apiDetail)
          ? await signer.collectNoteDetail(item)
          : null;
        const pageDetail = isUnavailableNoteDetail(rawPageDetail) ? null : rawPageDetail;
        if (!apiDetail && isUnavailableNoteDetail(rawPageDetail)) {
          skipped++;
          continue;
        }
        if (isUnavailableBookmarkItem(item) && !apiDetail && !pageDetail) {
          skipped++;
          continue;
        }
        const detail = mergeNoteDetail(apiDetail, pageDetail) ?? createFallbackNote(item);
        if (isUnavailableNoteDetail(detail)) {
          skipped++;
          continue;
        }
        detail.comments = filterWenYiWenAnswers(detail.comments);

        for (let index = 0; index < detail.media.length; index++) {
          const media = detail.media[index];
          if (media.type === "image" && !this.plugin.settings.downloadImages) continue;
          if (media.type === "video" && !this.plugin.settings.downloadVideos) continue;

          const result = await downloadMedia(media);
          if (result.data) {
            media.localPath = media.type === "video"
              ? await writer.writeVideo(detail.id, index + 1, result.data, result.ext)
              : await writer.writeMedia(detail.id, index + 1, result.data, result.ext);
          } else if (result.error) {
            media.downloadError = result.error;
          }
        }

        const syncIndex = this.plugin.settings.nextSyncIndex ?? 1;
        detail.syncIndex = syncIndex;
        detail.syncedAt = new Date().toISOString();
        await writer.writeNote(detail);
        this.plugin.settings.nextSyncIndex = syncIndex + 1;
        markNoteSynced(this.plugin.settings.syncedIds, item.noteId);
        saved++;
        if (saved >= this.plugin.settings.syncBatchSize) {
          reachedBatchLimit = true;
          break;
        }
      }

      if (!reachedBatchLimit) {
        this.plugin.settings.syncCursors.bookmark = page.cursor;
      }
      this.plugin.settings.lastSyncAt = Date.now();
      this.plugin.settings.lastSyncError = "";
      await this.plugin.updateSyncStatus({
        phase: "complete",
        message: `同步完成，新增 ${saved} 条，跳过 ${skipped} 条`,
        discoveredCount: page.notes.length,
        savedCount: saved,
        skippedCount: skipped,
        lastError: ""
      });
      await this.plugin.saveSettings();
      new Notice(`XHS sync complete: ${saved} notes saved.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const userMessage = sanitizeStatusMessage(userFacingSyncError(message));
      this.plugin.settings.lastSyncError = userMessage;
      await this.plugin.updateSyncStatus({
        phase: "failed",
        message: userMessage,
        lastError: userMessage,
        discoveredCount: this.plugin.settings.syncStatusSnapshot?.discoveredCount ?? 0,
        savedCount: this.plugin.settings.syncStatusSnapshot?.savedCount ?? 0,
        skippedCount: this.plugin.settings.syncStatusSnapshot?.skippedCount ?? 0
      });
      new Notice(`XHS sync failed: ${userMessage}`);
      throw error;
    } finally {
      signer.destroy();
      this.isSyncing = false;
    }
  }
}

function hasActualContent(note: XhsNote | null | undefined): note is XhsNote {
  return Boolean(note?.content?.trim());
}

function shouldCollectPageDetail(note: XhsNote | null | undefined): boolean {
  return !hasActualContent(note) || note.media.length === 0 || !hasWenYiWenAnswer(note.comments);
}

function mergeNoteDetail(
  apiDetail: XhsNote | null,
  pageDetail: XhsNote | null
): XhsNote | null {
  if (!apiDetail) return pageDetail;
  if (!pageDetail) return apiDetail;
  return {
    ...apiDetail,
    ...pageDetail,
    title: pageDetail.title || apiDetail.title,
    author: pageDetail.author || apiDetail.author,
    tags: pageDetail.tags.length ? pageDetail.tags : apiDetail.tags,
    content: pageDetail.content || apiDetail.content,
    media: pageDetail.media.length ? pageDetail.media : apiDetail.media,
    comments: mergeWenYiWenAnswers(apiDetail.comments, pageDetail.comments)
  };
}

function isWenYiWenAnswer(comment: XhsComment): boolean {
  return comment.author.trim() === "问一问" && Boolean(comment.content.trim());
}

function hasWenYiWenAnswer(comments: XhsComment[] | undefined): boolean {
  return Boolean(comments?.some(isWenYiWenAnswer));
}

function filterWenYiWenAnswers(comments: XhsComment[] | undefined): XhsComment[] {
  return (comments ?? []).filter(isWenYiWenAnswer);
}

function mergeWenYiWenAnswers(
  apiComments: XhsComment[] | undefined,
  pageComments: XhsComment[] | undefined
): XhsComment[] {
  const pageAnswers = filterWenYiWenAnswers(pageComments);
  if (pageAnswers.length) return pageAnswers;
  return filterWenYiWenAnswers(apiComments);
}

function mergeBookmarkPages(apiPage: BookmarkPage, collectedPage: BookmarkPage): BookmarkPage {
  const collectedById = new Map(collectedPage.notes.map((item) => [item.noteId, item]));
  const mergedNotes = apiPage.notes.map((item) => {
    const collected = collectedById.get(item.noteId);
    if (!collected) return item;
    return {
      ...collected,
      ...item,
      xsecToken: item.xsecToken || collected.xsecToken,
      title: collected.title || item.title,
      author: collected.author || item.author,
      coverUrl: collected.coverUrl || item.coverUrl,
      noteType: collected.noteType || item.noteType
    };
  });
  const apiIds = new Set(apiPage.notes.map((item) => item.noteId));
  for (const item of collectedPage.notes) {
    if (!apiIds.has(item.noteId)) mergedNotes.push(item);
  }

  return {
    notes: mergedNotes,
    cursor: apiPage.cursor || collectedPage.cursor,
    hasMore: apiPage.hasMore || collectedPage.hasMore,
    debug: {
      ...apiPage.debug,
      noteCount: mergedNotes.length,
      sourceSummary: [
        apiPage.debug.sourceSummary,
        collectedPage.debug.sourceSummary,
        `api=${apiPage.notes.length}`,
        `page=${collectedPage.notes.length}`
      ]
        .filter(Boolean)
        .join(","),
      itemKeySummary: collectedPage.debug.itemKeySummary || apiPage.debug.itemKeySummary,
      cardKeySummary: collectedPage.debug.cardKeySummary || apiPage.debug.cardKeySummary
    }
  };
}

async function collectVisibleBookmarksSafely(
  signer: SignManager,
  userId: string,
  pageSize: number
): Promise<BookmarkPage> {
  try {
    return await signer.collectBookmarks(userId, pageSize);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      notes: [],
      cursor: "",
      hasMore: false,
      debug: {
        topLevelKeys: ["page-collector"],
        dataKeys: [],
        noteCount: 0,
        hasMore: false,
        cursorPresent: false,
        codeType: "page-collector-error",
        messagePresent: true,
        messagePreview: sanitizeStatusMessage(message)
      }
    };
  }
}

async function collectApiBookmarksSafely(
  api: XhsApi,
  userId: string,
  cursor: string,
  pageSize: number
): Promise<BookmarkPage> {
  try {
    return await api.getBookmarks(userId, cursor, pageSize);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      notes: [],
      cursor: "",
      hasMore: false,
      debug: {
        topLevelKeys: ["api-collector"],
        dataKeys: [],
        noteCount: 0,
        hasMore: false,
        cursorPresent: false,
        codeType: "api-collector-error",
        messagePresent: true,
        messagePreview: sanitizeStatusMessage(message)
      }
    };
  }
}

export function userFacingSyncError(message: string): string {
  if (message.includes("Not logged in")) return "登录已失效，请重新登录小红书";
  if (message.includes("Webview load timeout")) return "小红书页面加载超时，请稍后重试";
  if (message.includes("HTTP 406")) return "小红书拒绝了当前请求，请重新登录后再试";
  if (message.includes("Account abnormal") || message.includes("300011")) {
    return "收藏接口被小红书拒绝，已尝试使用页面采集";
  }
  return message;
}

function isUnavailableBookmarkItem(item: {
  title?: string;
}): boolean {
  return isUnavailableTitle(item.title);
}

function isUnavailableNoteDetail(note: XhsNote | null | undefined): boolean {
  return isUnavailableTitle(note?.title) && !note?.content?.trim();
}

function isUnavailableTitle(title: string | undefined): boolean {
  return title?.trim().toLowerCase() === "sorry, this page isn't available right now.";
}

function createFallbackNote(item: {
  noteId: string;
  xsecToken: string;
  title?: string;
  author?: string;
  coverUrl?: string;
  noteType?: string;
}): XhsNote {
  const url = item.xsecToken
    ? `https://www.xiaohongshu.com/explore/${item.noteId}?xsec_token=${encodeURIComponent(item.xsecToken)}`
    : `https://www.xiaohongshu.com/explore/${item.noteId}`;

  return {
    id: item.noteId,
    title: item.title || `XHS Bookmark ${item.noteId.slice(0, 8)}`,
    author: item.author || "",
    url,
    tags: ["xhs", "xhs-bookmark"],
    content: [
      item.noteType ? `类型：${item.noteType}` : undefined,
      "已从小红书收藏列表同步。当前 Web 详情接口未返回完整正文，因此本笔记保留收藏页可见信息与原始链接。"
    ]
      .filter(Boolean)
      .join("\n\n"),
    media: item.coverUrl ? [{ type: "image", url: item.coverUrl, ext: "jpg" }] : []
  };
}
