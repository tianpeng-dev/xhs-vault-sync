import { afterEach, describe, expect, it, vi } from "vitest";
import { __setRequestUrlMock } from "./mocks/obsidian";
import { XhsApi } from "../src/xhs/api";
import type { XhsSignedHeaders } from "../src/xhs/sign-manager";

const signedHeaders: XhsSignedHeaders = {
  "x-s": "xs",
  "x-t": "xt",
  "x-s-common": "common",
  "x-b3-traceid": "trace"
};

describe("XhsApi", () => {
  afterEach(() => {
    __setRequestUrlMock(null);
    vi.restoreAllMocks();
  });

  it("sends stored login cookies with signed requests", async () => {
    const signer = { sign: vi.fn().mockResolvedValue(signedHeaders) };
    const api = new XhsApi(signer as never, "a1=session; webId=user");
    const requests: unknown[] = [];

    __setRequestUrlMock(async (options) => {
      requests.push(options);
      return {
        status: 200,
        json: { data: { user_id: "u1", nickname: "Alice", guest: false } }
      };
    });

    await api.getCurrentUser();

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      headers: {
        Cookie: "a1=session; webId=user",
        "x-s": "xs",
        "x-t": "xt",
        "x-s-common": "common",
        "x-b3-traceid": "trace"
      }
    });
  });

  it("uses webview signed fetch when the signer provides it", async () => {
    const signer = {
      sign: vi.fn().mockResolvedValue(signedHeaders),
      signedFetchJson: vi.fn().mockResolvedValue({
        data: { user_id: "u1", nickname: "Alice", guest: false }
      })
    };
    const api = new XhsApi(signer as never, "a1=session");

    __setRequestUrlMock(async () => {
      throw new Error("requestUrl should not be used when webview fetch is available");
    });

    await expect(api.getCurrentUser()).resolves.toEqual({ userId: "u1", userName: "Alice" });
    expect(signer.signedFetchJson).toHaveBeenCalledWith("GET", "/api/sns/web/v2/user/me");
    expect(signer.sign).not.toHaveBeenCalled();
  });

  it("requests collected notes for the current user id", async () => {
    const signer = { sign: vi.fn().mockResolvedValue(signedHeaders) };
    const api = new XhsApi(signer as never, "a1=session");
    const requests: Array<{ url?: string }> = [];

    __setRequestUrlMock(async (options) => {
      requests.push(options as { url?: string });
      return {
        status: 200,
        json: {
          data: {
            notes: [{ note_id: "note1", xsec_token: "token1" }],
            cursor: "next-cursor",
            has_more: true
          }
        }
      };
    });

    await expect(api.getBookmarks("u1", "", 5)).resolves.toEqual({
      notes: [{ noteId: "note1", xsecToken: "token1" }],
      cursor: "next-cursor",
      hasMore: true,
      debug: {
        topLevelKeys: ["data"],
        dataKeys: ["cursor", "has_more", "notes"],
        noteCount: 1,
        hasMore: true,
        cursorPresent: true,
        codeType: "undefined",
        messagePresent: false
      }
    });

    expect(requests[0]?.url).toContain("user_id=u1");
    expect(requests[0]?.url).toContain("num=5");
  });

  it("rejects abnormal bookmark API responses instead of falling back to page-only items", async () => {
    const signer = {
      signedFetchJson: vi.fn().mockResolvedValue({
        code: 300011,
        msg: "Account abnormal. Switch account and retry.",
        success: false,
        data: {}
      })
    };
    const api = new XhsApi(signer as never, "a1=session");

    await expect(api.getBookmarks("u1", "", 30)).rejects.toThrow(
      "XHS bookmark API rejected: Account abnormal. Switch account and retry."
    );
  });

  it("parses image note detail with multiple images and comments", async () => {
    const signer = {
      signedFetchJson: vi.fn().mockResolvedValue({
        data: {
          items: [
            {
              note_card: {
                note_id: "note-image",
                display_title: "图文标题",
                desc: "图文正文",
                user: { nickname: "作者" },
                tag_list: [{ name: "标签" }],
                image_list: [
                  { url_default: "https://img.example.com/1.jpg" },
                  { info_list: [{ url: "https://img.example.com/2.jpg" }] }
                ],
                comment_list: [
                  { content: "第一条评论", user: { nickname: "评论者" } }
                ]
              }
            }
          ]
        }
      })
    };
    const api = new XhsApi(signer as never, "a1=session");

    await expect(api.getNoteDetail("note-image", "token")).resolves.toMatchObject({
      id: "note-image",
      title: "图文标题",
      content: "图文正文",
      media: [
        { type: "image", url: "https://img.example.com/1.jpg" },
        { type: "image", url: "https://img.example.com/2.jpg" }
      ],
      comments: [{ author: "评论者", content: "第一条评论" }]
    });
  });

  it("ignores unavailable error pages returned as note detail", async () => {
    const signer = {
      signedFetchJson: vi.fn().mockResolvedValue({
        data: {
          items: [
            {
              note_card: {
                note_id: "missing-note",
                display_title: "Sorry, This Page Isn't Available Right Now.",
                desc: "",
                image_list: [{ url_default: "https://img.example.com/error.jpg" }]
              }
            }
          ]
        }
      })
    };
    const api = new XhsApi(signer as never, "a1=session");

    await expect(api.getNoteDetail("missing-note", "")).resolves.toBeNull();
  });
});
