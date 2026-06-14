import { requestUrl } from "obsidian";
import type { BookmarkPage, XhsComment, XhsMedia, XhsNote } from "../sync/types";
import { XHS_HOST } from "./hosts";
import type { SignManager } from "./sign-manager";

const USER_URL = "/api/sns/web/v2/user/me";
const BOOKMARK_URL = "/api/sns/web/v2/note/collect/page";
const FEED_URL = "/api/sns/web/v1/feed";

function summarizeScalar(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return undefined;
  return String(value).replace(/[A-Za-z0-9_-]{16,}/g, "[redacted]").slice(0, 120);
}

function isErrorCode(value: unknown): boolean {
  return value !== undefined && value !== null && String(value) !== "0";
}

function isUnavailableTitle(value: string): boolean {
  return value.trim().toLowerCase() === "sorry, this page isn't available right now.";
}

interface XhsUserResponse {
  data?: {
    user_id?: string;
    nickname?: string;
    guest?: boolean;
  };
}

interface XhsBookmarkResponse {
  code?: unknown;
  msg?: unknown;
  message?: unknown;
  data?: {
    notes?: Array<{
      id?: string;
      note_id?: string;
      xsec_token?: string;
    }>;
    cursor?: string;
    has_more?: boolean;
  };
}

interface XhsFeedResponse {
  data?: {
    items?: Array<{
      note_card?: {
        note_id?: string;
        title?: string;
        display_title?: string;
        desc?: string;
        time?: number;
        last_update_time?: number;
        user?: {
          nickname?: string;
        };
        tag_list?: Array<{
          name?: string;
        }>;
        comment_list?: Array<{
          content?: string;
          text?: string;
          create_time?: number;
          time?: number;
          like_count?: number | string;
          user?: {
            nickname?: string;
            nick_name?: string;
            name?: string;
          };
        }>;
        comments?: Array<{
          content?: string;
          text?: string;
          create_time?: number;
          time?: number;
          like_count?: number | string;
          user?: {
            nickname?: string;
            nick_name?: string;
            name?: string;
          };
        }>;
        image_list?: Array<{
          url?: string;
          url_default?: string;
          info_list?: Array<{
            url?: string;
          }>;
        }>;
      };
    }>;
  };
}

export class XhsApi {
  constructor(private readonly signer: SignManager, private readonly cookies: string) {}

  async getCurrentUser(): Promise<{ userId: string; userName: string }> {
    const data = (await this.signedGet(USER_URL)) as XhsUserResponse;
    const user = data.data;
    if (!user?.user_id || user.guest) throw new Error("Not logged in");
    return { userId: user.user_id, userName: user.nickname ?? "" };
  }

  async getBookmarks(userId: string, cursor: string, pageSize: number): Promise<BookmarkPage> {
    const query = new URLSearchParams({
      user_id: userId,
      cursor,
      num: String(pageSize),
      image_formats: "jpg,webp,avif"
    });
    const data = (await this.signedGet(`${BOOKMARK_URL}?${query.toString()}`)) as XhsBookmarkResponse;
    const rawNotes = data.data?.notes ?? [];
    const message = summarizeScalar(data.msg || data.message);
    if (!Array.isArray(data.data?.notes) && (message || isErrorCode(data.code))) {
      throw new Error(`XHS bookmark API rejected: ${message || summarizeScalar(data.code) || "unknown error"}`);
    }
    const notes = rawNotes
      .map((item) => ({
        noteId: item.note_id ?? item.id ?? "",
        xsecToken: item.xsec_token ?? ""
      }))
      .filter((item) => item.noteId);

    return {
      notes,
      cursor: data.data?.cursor ?? "",
      hasMore: Boolean(data.data?.has_more),
      debug: {
        topLevelKeys: Object.keys(data).sort(),
        dataKeys: Object.keys(data.data ?? {}).sort(),
        noteCount: rawNotes.length,
        hasMore: Boolean(data.data?.has_more),
        cursorPresent: Boolean(data.data?.cursor),
        codeType: typeof data.code,
        codeValue: summarizeScalar(data.code),
        messagePresent: Boolean(data.msg || data.message),
        messagePreview: summarizeScalar(data.msg || data.message)
      }
    };
  }

  async getNoteDetail(noteId: string, xsecToken: string): Promise<XhsNote | null> {
    const body = {
      source_note_id: noteId,
      image_formats: ["jpg", "webp", "avif"],
      extra: { need_body_topic: "1" },
      xsec_source: "pc_collect",
      xsec_token: xsecToken
    };
    const data = (await this.signedPost(FEED_URL, body)) as XhsFeedResponse;
    const note = data.data?.items?.[0]?.note_card;
    if (!note) return null;
    const title = note.display_title ?? note.title ?? "Untitled";
    const content = note.desc ?? "";
    if (isUnavailableTitle(title) && !content.trim()) return null;

    const images: XhsMedia[] = (note.image_list ?? [])
      .map((image) => ({
        type: "image" as const,
        url: image.url_default ?? image.url ?? image.info_list?.[0]?.url ?? "",
        ext: "jpg"
      }))
      .filter((item) => item.url);
    const comments: XhsComment[] = (note.comment_list ?? note.comments ?? [])
      .map((comment) => ({
        author: comment.user?.nickname ?? comment.user?.nick_name ?? comment.user?.name ?? "",
        content: comment.content ?? comment.text ?? "",
        createdAt: comment.create_time || comment.time
          ? new Date(comment.create_time ?? comment.time ?? 0).toISOString()
          : undefined,
        likes: comment.like_count == null ? undefined : String(comment.like_count)
      }))
      .filter((comment) => comment.content.trim());

    return {
      id: note.note_id ?? noteId,
      title,
      author: note.user?.nickname ?? "",
      url: `${XHS_HOST.web}/explore/${noteId}?xsec_token=${encodeURIComponent(xsecToken)}`,
      tags: (note.tag_list ?? []).map((tag) => tag.name ?? "").filter(Boolean),
      content,
      createdAt: note.time ? new Date(note.time).toISOString() : undefined,
      updatedAt: note.last_update_time ? new Date(note.last_update_time).toISOString() : undefined,
      media: images,
      comments
    };
  }

  private async signedGet(pathWithQuery: string): Promise<unknown> {
    if (this.signer.signedFetchJson) {
      return this.signer.signedFetchJson("GET", pathWithQuery);
    }

    const headers = await this.signer.sign(pathWithQuery);
    const response = await requestUrl({
      url: `${XHS_HOST.api}${pathWithQuery}`,
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Cookie: this.cookies,
        Origin: XHS_HOST.web,
        Referer: `${XHS_HOST.web}/`
      },
      throw: false
    });
    if (response.status >= 400) throw new Error(`XHS HTTP ${response.status}`);
    return response.json;
  }

  private async signedPost(path: string, body: unknown): Promise<unknown> {
    if (this.signer.signedFetchJson) {
      return this.signer.signedFetchJson("POST", path, body);
    }

    const headers = await this.signer.sign(path, body);
    const response = await requestUrl({
      url: `${XHS_HOST.api}${path}`,
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Cookie: this.cookies,
        Origin: XHS_HOST.web,
        Referer: `${XHS_HOST.web}/`
      },
      body: JSON.stringify(body),
      throw: false
    });
    if (response.status >= 400) throw new Error(`XHS HTTP ${response.status}`);
    return response.json;
  }
}
