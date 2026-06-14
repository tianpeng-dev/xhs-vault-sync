import { XHS_HOST } from "./hosts";
import type { BookmarkPage, XhsMedia, XhsNote } from "../sync/types";
import { XHS_PARTITION } from "./cookies";

type WebviewElement = HTMLElement & {
  executeJavaScript?: (code: string) => Promise<unknown>;
};

export interface XhsSignedHeaders {
  "x-s": string;
  "x-t": string;
  "x-s-common": string;
  "x-b3-traceid": string;
}

type XhsHttpMethod = "GET" | "POST";

export class SignManager {
  private webviewEl: WebviewElement | null = null;
  private ready = false;

  async initWebview(): Promise<void> {
    if (this.ready && this.webviewEl) return;

    const webview = document.createElement("webview") as WebviewElement;
    webview.setAttribute("src", XHS_HOST.explore);
    webview.setAttribute("partition", XHS_PARTITION);
    webview.setAttribute("allowpopups", "false");
    webview.setAttribute("style", "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;");
    document.body.appendChild(webview);
    this.webviewEl = webview;

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("Webview load timeout")), 30000);
        webview.addEventListener("did-finish-load", () => {
          window.clearTimeout(timeout);
          this.ready = true;
          resolve();
        });
        webview.addEventListener("did-fail-load", () => {
          window.clearTimeout(timeout);
          reject(new Error("Webview failed to load"));
        });
      });
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  private async loadUrl(url: string): Promise<void> {
    if (!this.webviewEl) throw new Error("Sign webview is not ready");

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Webview load timeout")), 30000);
      const cleanup = () => {
        window.clearTimeout(timeout);
        this.webviewEl?.removeEventListener("did-finish-load", onLoad);
        this.webviewEl?.removeEventListener("did-fail-load", onFail);
      };
      const onLoad = () => {
        cleanup();
        resolve();
      };
      const onFail = () => {
        cleanup();
        reject(new Error("Webview failed to load"));
      };
      this.webviewEl?.addEventListener("did-finish-load", onLoad);
      this.webviewEl?.addEventListener("did-fail-load", onFail);
      this.webviewEl?.setAttribute("src", url);
    });
  }

  destroy(): void {
    this.webviewEl?.parentElement?.removeChild(this.webviewEl);
    this.webviewEl = null;
    this.ready = false;
  }

  async sign(apiPath: string, body?: unknown): Promise<XhsSignedHeaders> {
    if (!this.webviewEl?.executeJavaScript) throw new Error("Sign webview is not ready");
    const script = this.buildInjectScript(apiPath, body ?? null);
    const result = (await this.webviewEl.executeJavaScript(script)) as Partial<XhsSignedHeaders> & {
      error?: string;
    } | null;
    if (!result) throw new Error("Sign inject returned no result");
    if (result.error) throw new Error(`Sign inject failed: ${result.error}`);
    if (!result["x-s"] || !result["x-t"] || !result["x-s-common"] || !result["x-b3-traceid"]) {
      throw new Error("Sign inject returned incomplete headers");
    }
    return result as XhsSignedHeaders;
  }

  async signedFetchJson(method: XhsHttpMethod, apiPath: string, body?: unknown): Promise<unknown> {
    if (!this.webviewEl?.executeJavaScript) throw new Error("Sign webview is not ready");
    const script = this.buildFetchScript(method, apiPath, body ?? null);
    const result = (await this.webviewEl.executeJavaScript(script)) as {
      status?: number;
      json?: unknown;
      text?: string;
      error?: string;
    } | null;
    if (!result) throw new Error("Webview fetch returned no result");
    if (result.error) throw new Error(`Webview fetch failed: ${result.error}`);
    if ((result.status ?? 0) >= 400) throw new Error(`XHS HTTP ${result.status}`);
    return result.json;
  }

  async collectBookmarks(userId: string, maxItems: number): Promise<BookmarkPage> {
    await this.loadUrl(`${XHS_HOST.web}/user/profile/${encodeURIComponent(userId)}`);
    if (!this.webviewEl?.executeJavaScript) throw new Error("Sign webview is not ready");

    const result = (await this.webviewEl.executeJavaScript(
      this.buildBookmarkCollectorScript(maxItems)
    )) as BookmarkPage | null;
    if (!result) throw new Error("Bookmark collector returned no result");
    return result;
  }

  async collectNoteDetail(item: {
    noteId: string;
    xsecToken: string;
    title?: string;
    author?: string;
    coverUrl?: string;
    noteType?: string;
  }): Promise<XhsNote | null> {
    const url = item.xsecToken
      ? `${XHS_HOST.web}/explore/${encodeURIComponent(item.noteId)}?xsec_token=${encodeURIComponent(item.xsecToken)}`
      : `${XHS_HOST.web}/explore/${encodeURIComponent(item.noteId)}`;
    await this.loadUrl(url);
    if (!this.webviewEl?.executeJavaScript) throw new Error("Sign webview is not ready");

    const result = (await this.webviewEl.executeJavaScript(
      this.buildNoteDetailCollectorScript(item)
    )) as XhsNote | null;
    if (isUnavailableNoteDetail(result)) return null;
    if (!result?.content?.trim() && !result?.media?.length && !result?.comments?.length) return null;
    return result;
  }

  buildInjectScript(apiPath: string, body: unknown): string {
    return `
      (function() {
        try {
          var apiUrl = ${JSON.stringify(apiPath)};
          var apiData = ${JSON.stringify(body)};
          var timestamp = Date.now();
          if (typeof window._webmsxyw === "function") {
            var nativeSign = window._webmsxyw(apiUrl, apiData);
            var nativeTraceId = "";
            var nativeTraceChars = "abcdef0123456789";
            for (var nativeTraceIndex = 0; nativeTraceIndex < 16; nativeTraceIndex++) {
              nativeTraceId += nativeTraceChars.charAt(Math.floor(Math.random() * nativeTraceChars.length));
            }
            return {
              "x-s": nativeSign["X-s"] || nativeSign["x-s"],
              "x-t": String(nativeSign["X-t"] || nativeSign["x-t"] || timestamp),
              "x-s-common": nativeSign["X-s-common"] || nativeSign["x-s-common"] || btoa(JSON.stringify({ x1: "4.3.3", x3: "xhs-pc-web" })),
              "x-b3-traceid": nativeSign["X-b3-traceid"] || nativeSign["x-b3-traceid"] || nativeTraceId
            };
          }
          if (typeof window.mnsv2 !== "function") {
            return { error: "window.mnsv2 not available" };
          }
          var payload = apiUrl;
          if (apiData !== null && apiData !== undefined) {
            payload += typeof apiData === "string" ? apiData : JSON.stringify(apiData);
          }
          var x3 = window.mnsv2(payload, "", "");
          var xS = "XYW_" + btoa(JSON.stringify({
            signSvn: "56",
            signType: "x2",
            appId: "xhs-pc-web",
            signVersion: "1",
            payload: x3
          }));
          var traceId = "";
          var chars = "abcdef0123456789";
          for (var i = 0; i < 16; i++) traceId += chars.charAt(Math.floor(Math.random() * chars.length));
          return {
            "x-s": xS,
            "x-t": String(timestamp),
            "x-s-common": btoa(JSON.stringify({ x1: "4.3.3", x3: "xhs-pc-web" })),
            "x-b3-traceid": traceId
          };
        } catch (e) {
          return { error: e && e.message ? e.message : "unknown signing error" };
        }
      })()
    `;
  }

  buildFetchScript(method: XhsHttpMethod, apiPath: string, body: unknown): string {
    return `
      (async function() {
        try {
          var apiPath = ${JSON.stringify(apiPath)};
          var apiData = ${JSON.stringify(body)};
          var method = ${JSON.stringify(method)};
          var headers = (${this.buildInjectScript(apiPath, body)});
          if (headers.error) return { error: headers.error };
          var response = await fetch(${JSON.stringify(XHS_HOST.api)} + apiPath, {
            method: method,
            credentials: "include",
            headers: Object.assign({}, headers, {
              "Content-Type": "application/json"
            }),
            body: method === "POST" ? JSON.stringify(apiData) : undefined
          });
          var text = await response.text();
          var json = null;
          try {
            json = text ? JSON.parse(text) : null;
          } catch (e) {
            json = null;
          }
          return { status: response.status, json: json, text: text };
        } catch (e) {
          return { error: e && e.message ? e.message : "unknown fetch error" };
        }
      })()
    `;
  }

  buildBookmarkCollectorScript(maxItems: number): string {
    const itemLimit = Math.max(1, Math.min(50, Math.floor(maxItems)));
    return `
      (async function() {
        var COLLECT_PATH = "/api/sns/web/v2/note/collect/page";
        var MAX_ITEMS = ${JSON.stringify(itemLimit)};
        var items = new Map();
        var xhrPages = 0;
        var itemKeys = new Set();
        var cardKeys = new Set();

        function sleep(ms) {
          return new Promise(function(resolve) { setTimeout(resolve, ms); });
        }

        function unwrap(value, depth) {
          var nextDepth = depth || 0;
          if (nextDepth > 8 || value == null) return value;
          if (Array.isArray(value)) return value.map(function(item) { return unwrap(item, nextDepth + 1); });
          if (typeof value !== "object") return value;
          if (Object.prototype.hasOwnProperty.call(value, "_rawValue")) return unwrap(value._rawValue, nextDepth + 1);
          if (Object.prototype.hasOwnProperty.call(value, "__v_raw")) return unwrap(value.__v_raw, nextDepth + 1);
          if (Object.prototype.hasOwnProperty.call(value, "value") && Object.keys(value).length <= 4) {
            return unwrap(value.value, nextDepth + 1);
          }
          return value;
        }

        function pick(values) {
          for (var index = 0; index < values.length; index++) {
            var value = values[index];
            if (value == null) continue;
            if (typeof value === "string" && value.trim() === "") continue;
            return value;
          }
          return "";
        }

        function add(raw, source) {
          var item = unwrap(raw) || {};
          var card = unwrap(item.noteCard) || unwrap(item.note_card) || item;
          var user = unwrap(card.user) || unwrap(item.user) || {};
          var cover = unwrap(card.cover) || unwrap(item.cover) || {};
          var imageList = unwrap(card.imageList || card.image_list || card.images || item.imageList || item.image_list || item.images) || [];
          var firstImage = Array.isArray(imageList) ? unwrap(imageList[0]) || {} : {};
          Object.keys(item).slice(0, 40).forEach(function(key) { itemKeys.add(key); });
          Object.keys(card).slice(0, 40).forEach(function(key) { cardKeys.add(key); });
          var noteId = pick([item.noteId, item.note_id, item.id, card.noteId, card.note_id]);
          if (!noteId) return;
          var xsecToken = pick([item.xsecToken, item.xsec_token, card.xsecToken, card.xsec_token]);
          var coverUrl = pick([
            cover && cover.url,
            cover && cover.default,
            cover && cover.urlDefault,
            cover && cover.url_default,
            cover && cover.info_list && cover.info_list[0] && cover.info_list[0].url,
            cover && cover.infoList && cover.infoList[0] && cover.infoList[0].url,
            firstImage && firstImage.urlDefault,
            firstImage && firstImage.url_default,
            firstImage && firstImage.url,
            firstImage && firstImage.info_list && firstImage.info_list[0] && firstImage.info_list[0].url,
            firstImage && firstImage.infoList && firstImage.infoList[0] && firstImage.infoList[0].url
          ]);
          var current = items.get(String(noteId)) || { noteId: String(noteId), xsecToken: "", title: "", author: "", coverUrl: "", noteType: "", sources: [] };
          if (xsecToken) current.xsecToken = String(xsecToken);
          current.title = current.title || String(pick([card.displayTitle, card.display_title, item.displayTitle, item.display_title, card.title, item.title]) || "");
          current.author = current.author || String(pick([user.nickname, user.nickName, user.nick_name, user.name]) || "");
          current.coverUrl = current.coverUrl || String(coverUrl || "");
          current.noteType = current.noteType || String(pick([card.noteType, card.note_type, item.noteType, item.note_type, card.type, item.type]) || (Array.isArray(imageList) && imageList.length ? "normal" : ""));
          if (current.sources.indexOf(source) === -1) current.sources.push(source);
          items.set(String(noteId), current);
        }

        function addCollection(rawCollection, source) {
          var collection = unwrap(rawCollection);
          var list = [];
          if (Array.isArray(collection)) list = collection;
          else if (collection && Array.isArray(collection.items)) list = collection.items;
          else if (collection && Array.isArray(collection.noteList)) list = collection.noteList;
          else if (collection && Array.isArray(collection.list)) list = collection.list;
          else if (collection && Array.isArray(collection.notes)) list = collection.notes;
          list.forEach(function(item) { add(item, source); });
        }

        function readInitialState() {
          var state = unwrap(window.__INITIAL_STATE__);
          var userState = unwrap(state && state.user) || {};
          var notesCollection = unwrap(userState.notes);
          if (notesCollection) addCollection(notesCollection[1], "ssr");
        }

        function scanDom() {
          Array.from(document.querySelectorAll('a[href*="/explore/"]')).forEach(function(anchor) {
            try {
              var url = new URL(anchor.getAttribute("href") || anchor.href, window.location.origin);
              var match = url.pathname.match(/\\/explore\\/([^/?#]+)/);
              if (!match) return;
              add({ note_id: decodeURIComponent(match[1]), xsec_token: url.searchParams.get("xsec_token") || "" }, "dom");
            } catch (error) {
              return;
            }
          });
        }

        function installXhrHook() {
          if (window.__xhsVaultSyncCollectHook) return;
          window.__xhsVaultSyncCollectHook = true;
          var originalOpen = XMLHttpRequest.prototype.open;
          var originalSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.open = function(method, url) {
            this.__xhsVaultSyncUrl = url ? String(url) : "";
            return originalOpen.apply(this, arguments);
          };
          XMLHttpRequest.prototype.send = function() {
            var xhr = this;
            var url = xhr.__xhsVaultSyncUrl || "";
            if (url.indexOf(COLLECT_PATH) !== -1) {
              xhr.addEventListener("load", function() {
                try {
                  var payload = JSON.parse(xhr.responseText || "{}");
                  var data = unwrap(payload.data) || {};
                  var notes = Array.isArray(data.notes) ? data.notes : Array.isArray(data.note_list) ? data.note_list : [];
                  notes.forEach(function(item) { add(item, "xhr"); });
                  xhrPages += 1;
                } catch (error) {
                  return;
                }
              }, { once: true });
            }
            return originalSend.apply(this, arguments);
          };
        }

        function clickCollectTab() {
          var candidates = Array.from(document.querySelectorAll(".reds-tab-item, [role='tab'], button, div"));
          var target = candidates.find(function(element) {
            return element && element.textContent && element.textContent.trim() === "收藏";
          });
          if (target) target.click();
        }

        installXhrHook();
        readInitialState();
        scanDom();
        clickCollectTab();
        await sleep(2500);
        readInitialState();
        scanDom();

        var staleRounds = 0;
        var previousCount = items.size;
        for (var index = 0; index < 12 && items.size < MAX_ITEMS; index++) {
          window.scrollBy(0, Math.max(600, Math.floor(window.innerHeight * 0.85)));
          await sleep(1600);
          readInitialState();
          scanDom();
          if (items.size === previousCount) staleRounds += 1;
          else staleRounds = 0;
          previousCount = items.size;
          if (staleRounds >= 4) break;
        }

        var orderedItems = Array.from(items.values()).sort(function(a, b) {
          return Number(Boolean(b.xsecToken)) - Number(Boolean(a.xsecToken));
        });
        var notes = orderedItems.slice(0, MAX_ITEMS).map(function(item) {
          return {
            noteId: item.noteId,
            xsecToken: item.xsecToken || "",
            title: item.title || "",
            author: item.author || "",
            coverUrl: item.coverUrl || "",
            noteType: item.noteType || ""
          };
        });
        var sourceCounts = { ssr: 0, xhr: 0, dom: 0 };
        Array.from(items.values()).forEach(function(item) {
          (item.sources || []).forEach(function(source) {
            if (sourceCounts[source] != null) sourceCounts[source] += 1;
          });
        });

        return {
          notes: notes,
          cursor: "",
          hasMore: false,
          debug: {
            topLevelKeys: ["page-collector"],
            dataKeys: ["ssr", "xhr", "dom"],
            noteCount: notes.length,
            hasMore: false,
            cursorPresent: false,
            codeType: "page-collector",
            codeValue: String(xhrPages),
            messagePresent: false,
            messagePreview: "sources=page",
            tokenCount: orderedItems.filter(function(item) { return item.xsecToken; }).length,
            sourceSummary: "ssr=" + sourceCounts.ssr + ",xhr=" + sourceCounts.xhr + ",dom=" + sourceCounts.dom,
            itemKeySummary: Array.from(itemKeys).sort().slice(0, 30).join(","),
            cardKeySummary: Array.from(cardKeys).sort().slice(0, 30).join(",")
          }
        };
      })()
    `;
  }

  buildNoteDetailCollectorScript(item: {
    noteId: string;
    xsecToken: string;
    title?: string;
    author?: string;
    coverUrl?: string;
    noteType?: string;
  }): string {
    const noteId = item.noteId;
    const xsecToken = item.xsecToken;
    return `
      (function() {
        var NOTE_ID = ${JSON.stringify(noteId)};
        var FALLBACK = ${JSON.stringify(item)};
        var XHS_WEB = ${JSON.stringify(XHS_HOST.web)};

        function unwrap(value, depth) {
          var nextDepth = depth || 0;
          if (nextDepth > 10 || value == null) return value;
          if (Array.isArray(value)) return value.map(function(item) { return unwrap(item, nextDepth + 1); });
          if (typeof value !== "object") return value;
          if (Object.prototype.hasOwnProperty.call(value, "_rawValue")) return unwrap(value._rawValue, nextDepth + 1);
          if (Object.prototype.hasOwnProperty.call(value, "__v_raw")) return unwrap(value.__v_raw, nextDepth + 1);
          if (Object.prototype.hasOwnProperty.call(value, "value") && Object.keys(value).length <= 4) {
            return unwrap(value.value, nextDepth + 1);
          }
          return value;
        }

        function pick(values) {
          for (var index = 0; index < values.length; index++) {
            var value = values[index];
            if (value == null) continue;
            if (Array.isArray(value)) value = value.filter(Boolean).join("\\n");
            if (typeof value !== "string" && typeof value !== "number") continue;
            var text = String(value).replace(/\\r\\n/g, "\\n").trim();
            if (text) return text;
          }
          return "";
        }

        function normalizeText(value) {
          return String(value || "")
            .replace(/\\u200b/g, "")
            .replace(/[ \\t]+\\n/g, "\\n")
            .replace(/\\n{3,}/g, "\\n\\n")
            .trim();
        }

        function meta(selector) {
          var element = document.querySelector(selector);
          return element ? element.getAttribute("content") || "" : "";
        }

        function textOf(selector) {
          var element = document.querySelector(selector);
          if (!element) return "";
          return normalizeText(element.innerText || element.textContent || "");
        }

        function findByNoteId(root) {
          var seen = [];
          var queue = [unwrap(root)];
          while (queue.length) {
            var current = unwrap(queue.shift());
            if (!current || typeof current !== "object") continue;
            if (seen.indexOf(current) !== -1) continue;
            seen.push(current);
            var card = unwrap(current.noteCard) || unwrap(current.note_card) || current;
            var id = pick([current.noteId, current.note_id, current.id, card.noteId, card.note_id, card.id]);
            if (id === NOTE_ID) return card;
            Object.keys(current).slice(0, 80).forEach(function(key) {
              var value = current[key];
              if (value && typeof value === "object") queue.push(value);
            });
          }
          return null;
        }

        function collectImages(card) {
          var images = [];
          function add(url) {
            if (!url) return;
            var text = String(url);
            if (!/^https?:\\/\\//.test(text)) return;
            if (images.indexOf(text) === -1) images.push(text);
          }

          var list = unwrap(card && (card.imageList || card.image_list || card.images || card.imageInfos || card.image_infos)) || [];
          if (Array.isArray(list)) {
            list.forEach(function(image) {
              image = unwrap(image) || {};
              add(image.urlDefault || image.url_default || image.url || image.src);
              var info = unwrap(image.infoList || image.info_list) || [];
              if (Array.isArray(info)) info.forEach(function(entry) { add(entry && entry.url); });
            });
          }
          add(FALLBACK.coverUrl);
          add(meta('meta[property="og:image"]'));
          Array.from(document.querySelectorAll('img[src]')).slice(0, 12).forEach(function(image) {
            var src = image.getAttribute("src") || "";
            if (/xhscdn|xiaohongshu|sns-webpic/.test(src)) add(src);
          });

          return images.slice(0, 20).map(function(url) {
            return { type: "image", url: url, ext: "jpg" };
          });
        }

        function collectComments(card) {
          var comments = [];
          function add(author, content, createdAt, likes) {
            var text = normalizeText(content);
            if (!text) return;
            if (comments.some(function(comment) { return comment.author === String(author || "") && comment.content === text; })) return;
            comments.push({
              author: String(author || ""),
              content: text,
              createdAt: createdAt ? String(createdAt) : undefined,
              likes: likes == null ? undefined : String(likes)
            });
          }

          var list = unwrap(card && (
            card.commentList ||
            card.comment_list ||
            card.comments ||
            card.commentInfo && card.commentInfo.comments ||
            card.comment_info && card.comment_info.comments
          )) || [];
          if (Array.isArray(list)) {
            list.forEach(function(rawComment) {
              var comment = unwrap(rawComment) || {};
              var user = unwrap(comment.user || comment.author) || {};
              add(
                pick([user.nickname, user.nickName, user.nick_name, user.name, comment.nickname]),
                pick([comment.content, comment.text, comment.commentContent, comment.comment_content, comment.desc]),
                pick([comment.createTime, comment.create_time, comment.time]),
                pick([comment.likeCount, comment.like_count, comment.likes])
              );
            });
          }

          Array.from(document.querySelectorAll(".comment-item, .comment-inner-container, .parent-comment")).slice(0, 30).forEach(function(element) {
            var author = "";
            var authorElement = element.querySelector(".author, .nickname, .user-name, [class*=name]");
            if (authorElement) author = normalizeText(authorElement.textContent || "");
            var contentElement = element.querySelector(".content, .comment-content, .note-text, [class*=content]");
            add(author, contentElement ? contentElement.textContent || "" : element.textContent || "");
          });

          return comments.slice(0, 50);
        }

        var initialState = unwrap(window.__INITIAL_STATE__);
        var card = findByNoteId(initialState) || {};
        var user = unwrap(card.user) || {};
        var title = pick([
          card.displayTitle,
          card.display_title,
          card.title,
          textOf("#detail-title"),
          textOf(".title"),
          meta('meta[property="og:title"]'),
          FALLBACK.title
        ]);
        var content = normalizeText(pick([
          card.desc,
          card.description,
          card.content,
          card.noteContent,
          card.note_content,
          card.text,
          card.body,
          textOf("#detail-desc"),
          textOf(".note-text"),
          textOf(".note-content .desc"),
          textOf(".desc"),
          meta('meta[name="description"]'),
          meta('meta[property="og:description"]')
        ]));
        var author = pick([
          user.nickname,
          user.nickName,
          user.nick_name,
          user.name,
          textOf(".author"),
          FALLBACK.author
        ]);
        var tagList = unwrap(card.tagList || card.tag_list || card.tags) || [];
        var tags = ["xhs", "xhs-bookmark"];
        if (Array.isArray(tagList)) {
          tagList.forEach(function(tag) {
            var name = pick([tag && tag.name, tag && tag.tagName, tag]);
            if (name && tags.indexOf(name) === -1) tags.push(name);
          });
        }

        return {
          id: NOTE_ID,
          title: title || FALLBACK.title || ("XHS Bookmark " + NOTE_ID.slice(0, 8)),
          author: author || "",
          url: FALLBACK.xsecToken
            ? XHS_WEB + "/explore/" + NOTE_ID + "?xsec_token=" + encodeURIComponent(FALLBACK.xsecToken)
            : XHS_WEB + "/explore/" + NOTE_ID,
          tags: tags,
          content: content,
          media: collectImages(card),
          comments: collectComments(card)
        };
      })()
    `;
  }
}

function isUnavailableNoteDetail(note: XhsNote | null | undefined): boolean {
  return isUnavailableTitle(note?.title) && !note?.content?.trim();
}

function isUnavailableTitle(title: string | undefined): boolean {
  return title?.trim().toLowerCase() === "sorry, this page isn't available right now.";
}
