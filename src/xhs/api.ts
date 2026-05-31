import { requestUrl } from "obsidian";
import type { BookmarkPage, XhsMedia, XhsNote } from "../sync/types";
import { XHS_HOST } from "./hosts";
import type { SignManager } from "./sign-manager";

const USER_URL = "/api/sns/web/v2/user/me";
const BOOKMARK_URL = "/api/sns/web/v2/note/collect/page";
const FEED_URL = "/api/sns/web/v1/feed";

interface XhsUserResponse {
  data?: {
    user_id?: string;
    nickname?: string;
    guest?: boolean;
  };
}

interface XhsBookmarkResponse {
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

  async getBookmarks(cursor: string, pageSize: number): Promise<BookmarkPage> {
    const query = new URLSearchParams({
      cursor,
      num: String(pageSize),
      image_formats: "jpg,webp,avif"
    });
    const data = (await this.signedGet(`${BOOKMARK_URL}?${query.toString()}`)) as XhsBookmarkResponse;
    const notes = (data.data?.notes ?? [])
      .map((item) => ({
        noteId: item.note_id ?? item.id ?? "",
        xsecToken: item.xsec_token ?? ""
      }))
      .filter((item) => item.noteId);

    return {
      notes,
      cursor: data.data?.cursor ?? "",
      hasMore: Boolean(data.data?.has_more)
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

    const images: XhsMedia[] = (note.image_list ?? [])
      .map((image) => ({
        type: "image" as const,
        url: image.url_default ?? image.url ?? image.info_list?.[0]?.url ?? "",
        ext: "jpg"
      }))
      .filter((item) => item.url);

    return {
      id: note.note_id ?? noteId,
      title: note.display_title ?? note.title ?? "Untitled",
      author: note.user?.nickname ?? "",
      url: `${XHS_HOST.web}/explore/${noteId}?xsec_token=${encodeURIComponent(xsecToken)}`,
      tags: (note.tag_list ?? []).map((tag) => tag.name ?? "").filter(Boolean),
      content: note.desc ?? "",
      createdAt: note.time ? new Date(note.time).toISOString() : undefined,
      updatedAt: note.last_update_time ? new Date(note.last_update_time).toISOString() : undefined,
      media: images
    };
  }

  private async signedGet(pathWithQuery: string): Promise<unknown> {
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
