/* XHS Vault Sync */
var K=Object.defineProperty;var ce=Object.getOwnPropertyDescriptor;var le=Object.getOwnPropertyNames;var ue=Object.prototype.hasOwnProperty;var de=(e,t)=>{for(var n in t)K(e,n,{get:t[n],enumerable:!0})},me=(e,t,n,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of le(t))!ue.call(e,r)&&r!==n&&K(e,r,{get:()=>t[r],enumerable:!(s=ce(t,r))||s.enumerable});return e};var ge=e=>me(K({},"__esModule",{value:!0}),e);var Ye={};de(Ye,{default:()=>V});module.exports=ge(Ye);var F=require("obsidian");var pe=/\b(cookie|token|xsec|xsec_token|a1|web_session|id_token)\s*=\s*[^\s&]+/gi,he=/(["']?\b(cookie|token|xsec|xsec_token|a1|web_session|id_token)\b["']?\s*:\s*)["']?[^"',\s}]+["']?/gi,fe=/\bauthorization\s*:\s*bearer\s+[^\s,}]+/gi;function k(e=0){return{phase:"idle",message:"\u7B49\u5F85\u540C\u6B65",updatedAt:e,discoveredCount:0,savedCount:0,skippedCount:0}}function u(e){return e.replace(pe,(t,n)=>`${n}=[redacted]`).replace(he,(t,n)=>{let s=n.trimStart().startsWith('"');return`${n}${s?'"[redacted]"':"[redacted]"}`}).replace(fe,"authorization: bearer [redacted]")}function te(e,t){return[...e,{...t,message:u(t.message)}].slice(-50)}function T(e){let t=u(e.message||"\u7B49\u5F85\u540C\u6B65");switch(e.phase){case"not_logged_in":return"\u5C0F\u7EA2\u4E66\uFF1A\u672A\u767B\u5F55";case"idle":return`\u5C0F\u7EA2\u4E66\uFF1A${t}`;case"opening_xhs":return"\u5C0F\u7EA2\u4E66\uFF1A\u6B63\u5728\u6253\u5F00\u5C0F\u7EA2\u4E66";case"collecting":return`\u5C0F\u7EA2\u4E66\uFF1A\u6B63\u5728\u8BFB\u53D6\u6536\u85CF\uFF08\u5DF2\u53D1\u73B0 ${e.discoveredCount} \u6761\uFF09`;case"saving":return`\u5C0F\u7EA2\u4E66\uFF1A\u6B63\u5728\u4FDD\u5B58 ${e.currentIndex??e.savedCount} / ${e.totalCount??e.discoveredCount}`;case"complete":return`\u5C0F\u7EA2\u4E66\uFF1A\u540C\u6B65\u5B8C\u6210\uFF08\u5DF2\u4FDD\u5B58 ${e.savedCount} \u6761\uFF0C\u5DF2\u8DF3\u8FC7 ${e.skippedCount} \u6761\uFF09`;case"failed":return`\u5C0F\u7EA2\u4E66\uFF1A\u540C\u6B65\u5931\u8D25\uFF1A${u(e.lastError||e.message||"\u672A\u77E5\u9519\u8BEF")}`}}function A(){return{rootFolder:"RedNote",autoSyncEnabled:!1,syncIntervalMinutes:10,syncBatchSize:5,activeSyncTarget:"bookmark",syncTargets:["bookmark"],downloadImages:!0,downloadVideos:!1,cookies:"",a1Cookie:"",userId:"",userName:"",syncCursors:{},syncedIds:{},allSynced:{},albumWhitelist:{},bookmarkCateNextCursor:{},cateSyncAllBookmark:{},perAccountState:{},nextSyncIndex:1,lastSyncAt:0,hasSeenOnboarding:!1,syncStatusSnapshot:k(),syncLog:[],lastSyncError:"",lastBookmarkDebug:void 0}}var tt=A();var $=require("obsidian");var d=require("obsidian");var ye=/[\\/:*?"<>|#^[\]]/g;function N(e,t="Untitled"){let n=e.replace(ye," ").replace(/\s+/g," ").trim();return!n||n==="."||n===".."?t.slice(0,120):n.slice(0,120)}function b(...e){return e.flatMap(t=>t.replace(/^\/+|\/+$/g,"").split("/")).filter(t=>t&&t!=="."&&t!=="..").join("/")}function h(e){return JSON.stringify(e)}function ve(e){return e.replace(/[\[\]]+/g," ").trim()}function we(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Se(e){try{let t=new URL(e);return t.protocol!=="http:"&&t.protocol!=="https:"?void 0:t.href.replace(/\)/g,"%29")}catch{return}}function xe(e){return e.replace(/\r\n/g,`
`).replace(/\n{3,}/g,`

`).trim()}function ke(e){return e.trim()==="\u95EE\u4E00\u95EE"}function ne(e){let t=e.tags.map(r=>`  - ${h(r)}`).join(`
`),n=e.media.map(r=>{if(r.localPath&&r.type==="image")return`![[${ve(r.localPath)}]]`;if(r.localPath&&r.type==="video")return`<video controls src="${we(r.localPath)}"></video>`;let i=Se(r.url);return i?`[${r.type} link](${i})`:`[${r.type} link unavailable]`}).join(`

`),s=(e.comments??[]).filter(r=>ke(r.author)).filter(r=>r.content.trim()).map((r,i)=>[`### \u56DE\u7B54 ${i+1}`,"",xe(r.content)].join(`
`)).join(`

`);return["---",`source: ${h("xiaohongshu")}`,`resourceId: ${h(e.id)}`,`title: ${h(e.title)}`,`author: ${h(e.author)}`,`url: ${h(e.url)}`,e.syncIndex?`syncIndex: ${e.syncIndex}`:void 0,e.syncedAt?`syncedAt: ${h(e.syncedAt)}`:void 0,e.createdAt?`createdAt: ${h(e.createdAt)}`:void 0,e.updatedAt?`updatedAt: ${h(e.updatedAt)}`:void 0,"tags:",t||'  - "xhs"',"---","",`# ${e.title||"Untitled"}`,"",e.content||"(No content)","",n||void 0,s?"## \u95EE\u4E00\u95EE\u56DE\u7B54":void 0,s?"":void 0,s||void 0].filter(r=>r!==void 0).join(`
`).trimEnd().concat(`
`)}var P=class{constructor(t,n){this.app=t;this.rootFolder=n}app;rootFolder;async ensureFolder(t){let n=(0,d.normalizePath)(t),s=this.app.vault.getAbstractFileByPath(n);if(s instanceof d.TFolder)return;if(s)throw new Error(`Vault path exists but is not a folder: ${n}`);let r=n.split("/").slice(0,-1).join("/");r&&await this.ensureFolder(r),await this.app.vault.createFolder(n)}async writeNote(t){await this.ensureFolder(this.rootFolder);let n=t.syncIndex?`${String(t.syncIndex).padStart(4,"0")}-`:"",s=`${N(`${n}${t.title||"Untitled"}-${t.id}`)}.md`,r=(0,d.normalizePath)(b(this.rootFolder,s)),i=ne(t),o=this.app.vault.getAbstractFileByPath(r);if(o instanceof d.TFile)await this.app.vault.modify(o,i);else{if(o)throw new Error(`Vault path exists but is not a file: ${r}`);await this.app.vault.create(r,i)}return r}async writeMedia(t,n,s,r){let i=(0,d.normalizePath)(b(this.rootFolder,"Media",N(t)));await this.ensureFolder(i);let o=(0,d.normalizePath)(b(i,`image-${n}.${r||"jpg"}`)),c=this.app.vault.getAbstractFileByPath(o);if(c instanceof d.TFile)await this.app.vault.delete(c);else if(c)throw new Error(`Vault path exists but is not a file: ${o}`);return await this.app.vault.createBinary(o,s),o}async writeVideo(t,n,s,r){let i=(0,d.normalizePath)(b(this.rootFolder,"Media",N(t)));await this.ensureFolder(i);let o=(0,d.normalizePath)(b(i,`video-${n}.${r||"mp4"}`)),c=this.app.vault.getAbstractFileByPath(o);if(c instanceof d.TFile)await this.app.vault.delete(c);else if(c)throw new Error(`Vault path exists but is not a file: ${o}`);return await this.app.vault.createBinary(o,s),o}};var z=require("obsidian");var l={web:"https://www.xiaohongshu.com",explore:"https://www.xiaohongshu.com/explore",api:"https://edith.xiaohongshu.com"};var be="/api/sns/web/v2/user/me",Ee="/api/sns/web/v2/note/collect/page",Ce="/api/sns/web/v1/feed";function L(e){if(!(typeof e!="string"&&typeof e!="number"&&typeof e!="boolean"))return String(e).replace(/[A-Za-z0-9_-]{16,}/g,"[redacted]").slice(0,120)}function _e(e){return e!=null&&String(e)!=="0"}function Ie(e){return e.trim().toLowerCase()==="sorry, this page isn't available right now."}var O=class{constructor(t,n){this.signer=t;this.cookies=n}signer;cookies;async getCurrentUser(){let n=(await this.signedGet(be)).data;if(!n?.user_id||n.guest)throw new Error("Not logged in");return{userId:n.user_id,userName:n.nickname??""}}async getBookmarks(t,n,s){let r=new URLSearchParams({user_id:t,cursor:n,num:String(s),image_formats:"jpg,webp,avif"}),i=await this.signedGet(`${Ee}?${r.toString()}`),o=i.data?.notes??[],c=L(i.msg||i.message);if(!Array.isArray(i.data?.notes)&&(c||_e(i.code)))throw new Error(`XHS bookmark API rejected: ${c||L(i.code)||"unknown error"}`);return{notes:o.map(m=>({noteId:m.note_id??m.id??"",xsecToken:m.xsec_token??""})).filter(m=>m.noteId),cursor:i.data?.cursor??"",hasMore:!!i.data?.has_more,debug:{topLevelKeys:Object.keys(i).sort(),dataKeys:Object.keys(i.data??{}).sort(),noteCount:o.length,hasMore:!!i.data?.has_more,cursorPresent:!!i.data?.cursor,codeType:typeof i.code,codeValue:L(i.code),messagePresent:!!(i.msg||i.message),messagePreview:L(i.msg||i.message)}}}async getNoteDetail(t,n){let s={source_note_id:t,image_formats:["jpg","webp","avif"],extra:{need_body_topic:"1"},xsec_source:"pc_collect",xsec_token:n},i=(await this.signedPost(Ce,s)).data?.items?.[0]?.note_card;if(!i)return null;let o=i.display_title??i.title??"Untitled",c=i.desc??"";if(Ie(o)&&!c.trim())return null;let y=(i.image_list??[]).map(a=>({type:"image",url:a.url_default??a.url??a.info_list?.[0]?.url??"",ext:"jpg"})).filter(a=>a.url),m=(i.comment_list??i.comments??[]).map(a=>({author:a.user?.nickname??a.user?.nick_name??a.user?.name??"",content:a.content??a.text??"",createdAt:a.create_time||a.time?new Date(a.create_time??a.time??0).toISOString():void 0,likes:a.like_count==null?void 0:String(a.like_count)})).filter(a=>a.content.trim());return{id:i.note_id??t,title:o,author:i.user?.nickname??"",url:`${l.web}/explore/${t}?xsec_token=${encodeURIComponent(n)}`,tags:(i.tag_list??[]).map(a=>a.name??"").filter(Boolean),content:c,createdAt:i.time?new Date(i.time).toISOString():void 0,updatedAt:i.last_update_time?new Date(i.last_update_time).toISOString():void 0,media:y,comments:m}}async signedGet(t){if(this.signer.signedFetchJson)return this.signer.signedFetchJson("GET",t);let n=await this.signer.sign(t),s=await(0,z.requestUrl)({url:`${l.api}${t}`,method:"GET",headers:{...n,"Content-Type":"application/json",Cookie:this.cookies,Origin:l.web,Referer:`${l.web}/`},throw:!1});if(s.status>=400)throw new Error(`XHS HTTP ${s.status}`);return s.json}async signedPost(t,n){if(this.signer.signedFetchJson)return this.signer.signedFetchJson("POST",t,n);let s=await this.signer.sign(t,n),r=await(0,z.requestUrl)({url:`${l.api}${t}`,method:"POST",headers:{...s,"Content-Type":"application/json",Cookie:this.cookies,Origin:l.web,Referer:`${l.web}/`},body:JSON.stringify(n),throw:!1});if(r.status>=400)throw new Error(`XHS HTTP ${r.status}`);return r.json}};var E="persist:xhs-vault-sync";function Te(e){let t=new Map;for(let n of e.split(";")){let s=n.trim();if(!s)continue;let r=s.indexOf("=");r<=0||t.set(s.slice(0,r),s.slice(r+1))}return t}function Ae(e,t){let n=Te(e);for(let s of t)!s.name||!s.value||n.set(s.name,s.value);return Array.from(n.entries()).map(([s,r])=>`${s}=${r}`).join("; ")}function Ne(){let e=require("electron");return e.session?.fromPartition(E)??e.remote?.session?.fromPartition(E)??null}async function X(e){let t=Ne();if(!t)return e;let[n,s]=await Promise.all([t.cookies.get({domain:"xiaohongshu.com"}),t.cookies.get({url:l.api})]);return Ae(e,[...n,...s])}var M=class{webviewEl=null;ready=!1;async initWebview(){if(this.ready&&this.webviewEl)return;let t=document.createElement("webview");t.setAttribute("src",l.explore),t.setAttribute("partition",E),t.setAttribute("allowpopups","false"),t.setAttribute("style","position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;"),document.body.appendChild(t),this.webviewEl=t;try{await new Promise((n,s)=>{let r=window.setTimeout(()=>s(new Error("Webview load timeout")),3e4);t.addEventListener("did-finish-load",()=>{window.clearTimeout(r),this.ready=!0,n()}),t.addEventListener("did-fail-load",()=>{window.clearTimeout(r),s(new Error("Webview failed to load"))})})}catch(n){throw this.destroy(),n}}async loadUrl(t){if(!this.webviewEl)throw new Error("Sign webview is not ready");await new Promise((n,s)=>{let r=window.setTimeout(()=>s(new Error("Webview load timeout")),3e4),i=()=>{window.clearTimeout(r),this.webviewEl?.removeEventListener("did-finish-load",o),this.webviewEl?.removeEventListener("did-fail-load",c)},o=()=>{i(),n()},c=()=>{i(),s(new Error("Webview failed to load"))};this.webviewEl?.addEventListener("did-finish-load",o),this.webviewEl?.addEventListener("did-fail-load",c),this.webviewEl?.setAttribute("src",t)})}destroy(){this.webviewEl?.parentElement?.removeChild(this.webviewEl),this.webviewEl=null,this.ready=!1}async sign(t,n){if(!this.webviewEl?.executeJavaScript)throw new Error("Sign webview is not ready");let s=this.buildInjectScript(t,n??null),r=await this.webviewEl.executeJavaScript(s);if(!r)throw new Error("Sign inject returned no result");if(r.error)throw new Error(`Sign inject failed: ${r.error}`);if(!r["x-s"]||!r["x-t"]||!r["x-s-common"]||!r["x-b3-traceid"])throw new Error("Sign inject returned incomplete headers");return r}async signedFetchJson(t,n,s){if(!this.webviewEl?.executeJavaScript)throw new Error("Sign webview is not ready");let r=this.buildFetchScript(t,n,s??null),i=await this.webviewEl.executeJavaScript(r);if(!i)throw new Error("Webview fetch returned no result");if(i.error)throw new Error(`Webview fetch failed: ${i.error}`);if((i.status??0)>=400)throw new Error(`XHS HTTP ${i.status}`);return i.json}async collectBookmarks(t,n){if(await this.loadUrl(`${l.web}/user/profile/${encodeURIComponent(t)}`),!this.webviewEl?.executeJavaScript)throw new Error("Sign webview is not ready");let s=await this.webviewEl.executeJavaScript(this.buildBookmarkCollectorScript(n));if(!s)throw new Error("Bookmark collector returned no result");return s}async collectNoteDetail(t){let n=t.xsecToken?`${l.web}/explore/${encodeURIComponent(t.noteId)}?xsec_token=${encodeURIComponent(t.xsecToken)}`:`${l.web}/explore/${encodeURIComponent(t.noteId)}`;if(await this.loadUrl(n),!this.webviewEl?.executeJavaScript)throw new Error("Sign webview is not ready");let s=await this.webviewEl.executeJavaScript(this.buildNoteDetailCollectorScript(t));return Pe(s)||!s?.content?.trim()&&!s?.media?.length&&!s?.comments?.length?null:s}buildInjectScript(t,n){return`
      (function() {
        try {
          var apiUrl = ${JSON.stringify(t)};
          var apiData = ${JSON.stringify(n)};
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
    `}buildFetchScript(t,n,s){return`
      (async function() {
        try {
          var apiPath = ${JSON.stringify(n)};
          var apiData = ${JSON.stringify(s)};
          var method = ${JSON.stringify(t)};
          var headers = (${this.buildInjectScript(n,s)});
          if (headers.error) return { error: headers.error };
          var response = await fetch(${JSON.stringify(l.api)} + apiPath, {
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
    `}buildBookmarkCollectorScript(t){let n=Math.max(1,Math.min(50,Math.floor(t)));return`
      (async function() {
        var COLLECT_PATH = "/api/sns/web/v2/note/collect/page";
        var MAX_ITEMS = ${JSON.stringify(n)};
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
            return element && element.textContent && element.textContent.trim() === "\u6536\u85CF";
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
    `}buildNoteDetailCollectorScript(t){let n=t.noteId,s=t.xsecToken;return`
      (function() {
        var NOTE_ID = ${JSON.stringify(n)};
        var FALLBACK = ${JSON.stringify(t)};
        var XHS_WEB = ${JSON.stringify(l.web)};

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
    `}};function Pe(e){return Le(e?.title)&&!e?.content?.trim()}function Le(e){return e?.trim().toLowerCase()==="sorry, this page isn't available right now."}var re=require("obsidian");function Oe(e){return e.ext?e.ext:e.type==="video"?"mp4":"jpg"}function Xe(e){return e.startsWith("http://")?`https://${e.slice(7)}`:e}async function se(e){let t=Oe(e);try{let n=await(0,re.requestUrl)({url:Xe(e.url),method:"GET",throw:!1,...e.type==="video"?{headers:{Range:"bytes=0-"}}:{}});return n.status<200||n.status>=300?{ext:t,error:`HTTP ${n.status}`}:{ext:t,data:n.arrayBuffer}}catch(n){let s=n instanceof Error?n.message:String(n);return{ext:t,error:s}}}function Me(e,t){return e[t]!==!0}function $e(e,t){e[t]=!0}var B=class{constructor(t){this.plugin=t}plugin;isSyncing=!1;async syncBookmarks(){if(this.isSyncing){new $.Notice("XHS sync is already running.");return}this.isSyncing=!0;let t=new M;try{await this.plugin.updateSyncStatus({phase:"opening_xhs",message:"\u6B63\u5728\u6253\u5F00\u5C0F\u7EA2\u4E66\u9875\u9762",startedAt:Date.now(),discoveredCount:0,savedCount:0,skippedCount:0}),await t.initWebview();let n=`a1=${this.plugin.settings.a1Cookie}`,s=await X(n);this.plugin.settings.cookies="";let r=new O(t,s),i=new P(this.plugin.app,this.plugin.settings.rootFolder),o=await r.getCurrentUser();this.plugin.settings.userId=o.userId,this.plugin.settings.userName=o.userName,await this.plugin.updateSyncStatus({phase:"collecting",message:"\u6B63\u5728\u8BFB\u53D6\u6536\u85CF",discoveredCount:0,savedCount:0,skippedCount:0});let c=Math.max(30,this.plugin.settings.syncBatchSize),y=await Fe(r,o.userId,this.plugin.settings.syncCursors.bookmark??"",c),m=await Ve(t,o.userId,c),a=He(y,m);this.plugin.settings.lastBookmarkDebug=a.debug;let v=0,f=0,J=0,Y=!1,Z=Math.min(a.notes.length,this.plugin.settings.syncBatchSize);await this.plugin.updateSyncStatus({phase:"saving",message:"\u6B63\u5728\u4FDD\u5B58",discoveredCount:a.notes.length,savedCount:v,skippedCount:f,currentIndex:J,totalCount:Z});for(let w of a.notes){if(!Me(this.plugin.settings.syncedIds,w.noteId)){f++;continue}J++,await this.plugin.updateSyncStatus({phase:"saving",message:"\u6B63\u5728\u4FDD\u5B58",discoveredCount:a.notes.length,savedCount:v,skippedCount:f,currentIndex:J,totalCount:Z});let I=await r.getNoteDetail(w.noteId,w.xsecToken),W=Re(I)?await t.collectNoteDetail(w):null,Q=q(W)?null:W;if(!I&&q(W)){f++;continue}if(We(w)&&!I&&!Q){f++;continue}let g=De(I,Q)??Ke(w);if(q(g)){f++;continue}g.comments=G(g.comments);for(let _=0;_<g.media.length;_++){let x=g.media[_];if(x.type==="image"&&!this.plugin.settings.downloadImages||x.type==="video"&&!this.plugin.settings.downloadVideos)continue;let S=await se(x);S.data?x.localPath=x.type==="video"?await i.writeVideo(g.id,_+1,S.data,S.ext):await i.writeMedia(g.id,_+1,S.data,S.ext):S.error&&(x.downloadError=S.error)}let ee=this.plugin.settings.nextSyncIndex??1;if(g.syncIndex=ee,g.syncedAt=new Date().toISOString(),await i.writeNote(g),this.plugin.settings.nextSyncIndex=ee+1,$e(this.plugin.settings.syncedIds,w.noteId),v++,v>=this.plugin.settings.syncBatchSize){Y=!0;break}}Y||(this.plugin.settings.syncCursors.bookmark=a.cursor),this.plugin.settings.lastSyncAt=Date.now(),this.plugin.settings.lastSyncError="",await this.plugin.updateSyncStatus({phase:"complete",message:`\u540C\u6B65\u5B8C\u6210\uFF0C\u65B0\u589E ${v} \u6761\uFF0C\u8DF3\u8FC7 ${f} \u6761`,discoveredCount:a.notes.length,savedCount:v,skippedCount:f,lastError:""}),await this.plugin.saveSettings(),new $.Notice(`XHS sync complete: ${v} notes saved.`)}catch(n){let s=n instanceof Error?n.message:String(n),r=u(Je(s));throw this.plugin.settings.lastSyncError=r,await this.plugin.updateSyncStatus({phase:"failed",message:r,lastError:r,discoveredCount:this.plugin.settings.syncStatusSnapshot?.discoveredCount??0,savedCount:this.plugin.settings.syncStatusSnapshot?.savedCount??0,skippedCount:this.plugin.settings.syncStatusSnapshot?.skippedCount??0}),new $.Notice(`XHS sync failed: ${r}`),n}finally{t.destroy(),this.isSyncing=!1}}};function Be(e){return!!e?.content?.trim()}function Re(e){return!Be(e)||e.media.length===0||!Ue(e.comments)}function De(e,t){return e?t?{...e,...t,title:t.title||e.title,author:t.author||e.author,tags:t.tags.length?t.tags:e.tags,content:t.content||e.content,media:t.media.length?t.media:e.media,comments:je(e.comments,t.comments)}:e:t}function ie(e){return e.author.trim()==="\u95EE\u4E00\u95EE"&&!!e.content.trim()}function Ue(e){return!!e?.some(ie)}function G(e){return(e??[]).filter(ie)}function je(e,t){let n=G(t);return n.length?n:G(e)}function He(e,t){let n=new Map(t.notes.map(i=>[i.noteId,i])),s=e.notes.map(i=>{let o=n.get(i.noteId);return o?{...o,...i,xsecToken:i.xsecToken||o.xsecToken,title:o.title||i.title,author:o.author||i.author,coverUrl:o.coverUrl||i.coverUrl,noteType:o.noteType||i.noteType}:i}),r=new Set(e.notes.map(i=>i.noteId));for(let i of t.notes)r.has(i.noteId)||s.push(i);return{notes:s,cursor:e.cursor||t.cursor,hasMore:e.hasMore||t.hasMore,debug:{...e.debug,noteCount:s.length,sourceSummary:[e.debug.sourceSummary,t.debug.sourceSummary,`api=${e.notes.length}`,`page=${t.notes.length}`].filter(Boolean).join(","),itemKeySummary:t.debug.itemKeySummary||e.debug.itemKeySummary,cardKeySummary:t.debug.cardKeySummary||e.debug.cardKeySummary}}}async function Ve(e,t,n){try{return await e.collectBookmarks(t,n)}catch(s){let r=s instanceof Error?s.message:String(s);return{notes:[],cursor:"",hasMore:!1,debug:{topLevelKeys:["page-collector"],dataKeys:[],noteCount:0,hasMore:!1,cursorPresent:!1,codeType:"page-collector-error",messagePresent:!0,messagePreview:u(r)}}}}async function Fe(e,t,n,s){try{return await e.getBookmarks(t,n,s)}catch(r){let i=r instanceof Error?r.message:String(r);return{notes:[],cursor:"",hasMore:!1,debug:{topLevelKeys:["api-collector"],dataKeys:[],noteCount:0,hasMore:!1,cursorPresent:!1,codeType:"api-collector-error",messagePresent:!0,messagePreview:u(i)}}}}function Je(e){return e.includes("Not logged in")?"\u767B\u5F55\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u5C0F\u7EA2\u4E66":e.includes("Webview load timeout")?"\u5C0F\u7EA2\u4E66\u9875\u9762\u52A0\u8F7D\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5":e.includes("HTTP 406")?"\u5C0F\u7EA2\u4E66\u62D2\u7EDD\u4E86\u5F53\u524D\u8BF7\u6C42\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u540E\u518D\u8BD5":e.includes("Account abnormal")||e.includes("300011")?"\u6536\u85CF\u63A5\u53E3\u88AB\u5C0F\u7EA2\u4E66\u62D2\u7EDD\uFF0C\u5DF2\u5C1D\u8BD5\u4F7F\u7528\u9875\u9762\u91C7\u96C6":e}function We(e){return oe(e.title)}function q(e){return oe(e?.title)&&!e?.content?.trim()}function oe(e){return e?.trim().toLowerCase()==="sorry, this page isn't available right now."}function Ke(e){let t=e.xsecToken?`https://www.xiaohongshu.com/explore/${e.noteId}?xsec_token=${encodeURIComponent(e.xsecToken)}`:`https://www.xiaohongshu.com/explore/${e.noteId}`;return{id:e.noteId,title:e.title||`XHS Bookmark ${e.noteId.slice(0,8)}`,author:e.author||"",url:t,tags:["xhs","xhs-bookmark"],content:[e.noteType?`\u7C7B\u578B\uFF1A${e.noteType}`:void 0,"\u5DF2\u4ECE\u5C0F\u7EA2\u4E66\u6536\u85CF\u5217\u8868\u540C\u6B65\u3002\u5F53\u524D Web \u8BE6\u60C5\u63A5\u53E3\u672A\u8FD4\u56DE\u5B8C\u6574\u6B63\u6587\uFF0C\u56E0\u6B64\u672C\u7B14\u8BB0\u4FDD\u7559\u6536\u85CF\u9875\u53EF\u89C1\u4FE1\u606F\u4E0E\u539F\u59CB\u94FE\u63A5\u3002"].filter(Boolean).join(`

`),media:e.coverUrl?[{type:"image",url:e.coverUrl,ext:"jpg"}]:[]}}var C=require("obsidian");var R=class extends C.Modal{constructor(n){super(n.app);this.plugin=n}plugin;webviewEl=null;onOpen(){this.modalEl.addClass("xhs-login-modal"),this.contentEl.empty();let n=this.contentEl.createDiv({cls:"xhs-webview-container"}),s=document.createElement("webview");s.setAttribute("src",l.web),s.setAttribute("partition",E),s.setAttribute("allowpopups","true"),n.appendChild(s),this.webviewEl=s,this.contentEl.createDiv().createEl("button",{text:"I am logged in"}).addEventListener("click",()=>{this.handleLoginComplete()})}async handleLoginComplete(){if(!this.webviewEl?.executeJavaScript){new C.Notice("\u767B\u5F55\u7A97\u53E3\u5C1A\u672A\u51C6\u5907\u597D\u3002");return}let n=await this.webviewEl.executeJavaScript("document.cookie"),r=(await X(n)).match(/(?:^|;\s*)a1=([^;]+)/)?.[1]??"";if(!r){new C.Notice("\u672A\u627E\u5230 a1 Cookie\uFF0C\u8BF7\u5148\u5B8C\u6210\u767B\u5F55\u3002");return}this.plugin.settings.cookies="",this.plugin.settings.a1Cookie=r,await this.plugin.saveSettings(),await this.plugin.updateSyncStatus({phase:"idle",message:"\u767B\u5F55\u6210\u529F\uFF0C\u53EF\u4EE5\u5F00\u59CB\u540C\u6B65",discoveredCount:0,savedCount:0,skippedCount:0}),new C.Notice("\u5C0F\u7EA2\u4E66\u767B\u5F55\u5DF2\u4FDD\u5B58\u3002\u4E0B\u4E00\u6B65\u6267\u884C\u7ACB\u5373\u540C\u6B65\u4E66\u7B7E\u3002"),this.close()}onClose(){this.contentEl.empty(),this.webviewEl=null}};var U=require("obsidian"),D=class extends U.Modal{constructor(n){super(n.app);this.plugin=n}plugin;hasMarkedSeen=!1;onOpen(){let{contentEl:n}=this;this.markOnboardingSeen(),n.empty(),n.createEl("h2",{text:"\u5F00\u59CB\u540C\u6B65\u5C0F\u7EA2\u4E66\u6536\u85CF"});let s=n.createEl("ol");s.createEl("li",{text:"\u70B9\u51FB\u201C\u767B\u5F55\u5C0F\u7EA2\u4E66\u201D\uFF0C\u5728\u5F39\u7A97\u4E2D\u5B8C\u6210\u767B\u5F55\u3002"}),s.createEl("li",{text:"\u5728\u767B\u5F55\u5F39\u7A97\u70B9\u51FB\u5B8C\u6210\u767B\u5F55\u6309\u94AE\uFF08I am logged in\uFF09\u3002"}),s.createEl("li",{text:"\u70B9\u51FB\u201C\u7ACB\u5373\u540C\u6B65\u201D\uFF0C\u63D2\u4EF6\u4F1A\u628A\u6536\u85CF\u4FDD\u5B58\u5230 RedNote\u3002"}),s.createEl("li",{text:"\u540C\u6B65\u8FC7\u7A0B\u4E2D\u53EF\u4EE5\u5728\u72B6\u6001\u680F\u6216\u201C\u67E5\u770B\u72B6\u6001\u201D\u91CC\u770B\u8FDB\u5EA6\u3002"}),new U.Setting(n).addButton(r=>r.setButtonText("\u767B\u5F55\u5C0F\u7EA2\u4E66").setCta().onClick(async()=>{await this.markOnboardingSeen(),this.close(),this.plugin.openLoginModal()})).addButton(r=>r.setButtonText("\u7A0D\u540E\u518D\u8BF4").onClick(async()=>{await this.markOnboardingSeen(),this.close()}))}async markOnboardingSeen(){this.hasMarkedSeen||this.plugin.settings.hasSeenOnboarding||(this.hasMarkedSeen=!0,this.plugin.settings.hasSeenOnboarding=!0,await this.plugin.saveSettings())}onClose(){this.contentEl.empty()}};var p=require("obsidian"),j=class extends p.PluginSettingTab{constructor(n,s){super(n,s);this.plugin=s}plugin;display(){let{containerEl:n}=this;n.empty(),n.createEl("h2",{text:"XHS Vault Sync"}),n.createEl("h3",{text:"\u5F53\u524D\u72B6\u6001"}),n.createEl("p",{text:this.plugin.settings.a1Cookie?"\u767B\u5F55\u72B6\u6001\uFF1A\u5DF2\u4FDD\u5B58\u767B\u5F55\u6001":"\u767B\u5F55\u72B6\u6001\uFF1A\u672A\u767B\u5F55"}),n.createEl("p",{text:this.plugin.settings.lastSyncAt?`\u4E0A\u6B21\u540C\u6B65\uFF1A${new Date(this.plugin.settings.lastSyncAt).toLocaleString()}`:"\u4E0A\u6B21\u540C\u6B65\uFF1A\u6682\u65E0"}),n.createEl("p",{text:`\u5DF2\u540C\u6B65\uFF1A${Object.keys(this.plugin.settings.syncedIds).length} \u6761`});let s=!!this.plugin.settings.a1Cookie;new p.Setting(n).setName("\u64CD\u4F5C").setDesc(s?"\u767B\u5F55\u540E\u5373\u53EF\u540C\u6B65\u5C0F\u7EA2\u4E66\u6536\u85CF\u3002":"\u8BF7\u5148\u767B\u5F55\u5C0F\u7EA2\u4E66\uFF0C\u518D\u6267\u884C\u540C\u6B65\u3002").addButton(r=>r.setButtonText("\u767B\u5F55\u5C0F\u7EA2\u4E66").onClick(()=>{this.plugin.openLoginModal()})).addButton(r=>r.setButtonText("\u7ACB\u5373\u540C\u6B65").setCta().setDisabled(!s).onClick(()=>{this.plugin.syncNow()})).addButton(r=>r.setButtonText("\u67E5\u770B\u72B6\u6001").onClick(()=>{this.plugin.openStatusModal()})),new p.Setting(n).setName("\u81EA\u52A8\u540C\u6B65").setDesc("\u6309\u56FA\u5B9A\u95F4\u9694\u540C\u6B65\u6536\u85CF\uFF0C\u6700\u5C0F\u95F4\u9694\u4E3A 5 \u5206\u949F\u3002").addToggle(r=>r.setValue(this.plugin.settings.autoSyncEnabled).onChange(async i=>{this.plugin.settings.autoSyncEnabled=i,await this.plugin.saveSettings(),this.plugin.startSyncInterval()})),new p.Setting(n).setName("\u540C\u6B65\u95F4\u9694\uFF08\u5206\u949F\uFF09").setDesc("\u6700\u5C0F 5 \u5206\u949F\u3002").addText(r=>r.setValue(String(this.plugin.settings.syncIntervalMinutes)).onChange(async i=>{let o=Number(i);this.plugin.settings.syncIntervalMinutes=Number.isFinite(o)?Math.max(5,Math.floor(o)):10,await this.plugin.saveSettings(),this.plugin.startSyncInterval()})),new p.Setting(n).setName("\u4FDD\u5B58\u76EE\u5F55").setDesc("\u540C\u6B65\u7684 Markdown \u548C\u5A92\u4F53\u6587\u4EF6\u4F1A\u4FDD\u5B58\u5230\u6B64\u76EE\u5F55\u4E0B\u3002").addText(r=>r.setPlaceholder("RedNote").setValue(this.plugin.settings.rootFolder).onChange(async i=>{this.plugin.settings.rootFolder=i.trim()||"RedNote",await this.plugin.saveSettings()})),new p.Setting(n).setName("\u5355\u6B21\u540C\u6B65\u6570\u91CF").setDesc("\u6BCF\u6B21\u540C\u6B65\u7684\u7B14\u8BB0\u6570\u91CF\uFF0C\u8303\u56F4\u4E3A 1 \u5230 10\uFF0C\u964D\u4F4E\u89E6\u53D1\u9650\u6D41\u7684\u98CE\u9669\u3002").addText(r=>r.setPlaceholder("5").setValue(String(this.plugin.settings.syncBatchSize)).onChange(async i=>{let o=Number(i);this.plugin.settings.syncBatchSize=Number.isFinite(o)?Math.min(10,Math.max(1,Math.floor(o))):5,await this.plugin.saveSettings()})),new p.Setting(n).setName("\u4E0B\u8F7D\u56FE\u7247").setDesc("\u5C06\u7B14\u8BB0\u56FE\u7247\u4FDD\u5B58\u5230\u5E93\u4E2D\uFF0C\u800C\u4E0D\u662F\u5F15\u7528\u8FDC\u7A0B\u94FE\u63A5\u3002").addToggle(r=>r.setValue(this.plugin.settings.downloadImages).onChange(async i=>{this.plugin.settings.downloadImages=i,await this.plugin.saveSettings()})),new p.Setting(n).setName("\u4E0B\u8F7D\u89C6\u9891").setDesc("\u5C06\u89C6\u9891\u7B14\u8BB0\u4FDD\u5B58\u5230\u5E93\u4E2D\uFF0C\u800C\u4E0D\u662F\u5F15\u7528\u8FDC\u7A0B\u94FE\u63A5\u3002").addToggle(r=>r.setValue(this.plugin.settings.downloadVideos).onChange(async i=>{this.plugin.settings.downloadVideos=i,await this.plugin.saveSettings()}))}};var ae=require("obsidian");var ze=/\s*\b(raw_response|rawResponse|originalResponse|原始响应)\b[\s\S]*$/i;function qe(e,t){return e?new Date(e).toLocaleString():t}function Ge(e){return u(e).replace(ze,"[response redacted]").trim()}var H=class extends ae.Modal{constructor(n){super(n.app);this.plugin=n}plugin;onOpen(){let{contentEl:n}=this,{settings:s}=this.plugin,r=s.syncStatusSnapshot,i=Object.keys(s.syncedIds??{}).length,o=s.lastBookmarkDebug;n.empty(),n.createEl("h2",{text:"XHS Vault Sync \u72B6\u6001"}),n.createEl("p",{text:T(r)}),n.createEl("p",{text:`\u4E0A\u6B21\u540C\u6B65\uFF1A${qe(s.lastSyncAt,"\u6682\u65E0")}`}),n.createEl("p",{text:`\u5DF2\u540C\u6B65\uFF1A${i} \u6761`}),n.createEl("p",{text:`\u4FDD\u5B58\u76EE\u5F55\uFF1A${s.rootFolder}`}),n.createEl("h3",{text:"\u6700\u8FD1\u91C7\u96C6\u6458\u8981"}),o?(n.createEl("p",{text:`\u5019\u9009\uFF1A${o.noteCount} \u6761`}),n.createEl("p",{text:`\u6765\u6E90\uFF1A${o.sourceSummary||"\u65E0"}`}),n.createEl("p",{text:`\u5E26\u8BBF\u95EE\u4EE4\u724C\uFF1A${o.tokenCount??0} \u6761`})):n.createEl("p",{text:"\u6682\u65E0\u91C7\u96C6\u6458\u8981"}),n.createEl("h3",{text:"\u6700\u8FD1\u65E5\u5FD7"});let c=n.createEl("ul"),y=[...s.syncLog??[]].slice(-10).reverse();if(y.length===0){c.createEl("li",{text:"\u6682\u65E0\u65E5\u5FD7"});return}for(let m of y)c.createEl("li",{text:`${new Date(m.time).toLocaleTimeString()} ${Ge(m.message)}`})}onClose(){this.contentEl.empty()}};var V=class extends F.Plugin{settings=A();syncEngine=null;syncIntervalId=null;statusBarEl=null;isSyncing=!1;isUnloaded=!1;async onload(){this.isUnloaded=!1,await this.loadSettings(),this.syncEngine=new B(this),this.addSettingTab(new j(this.app,this)),this.statusBarEl=this.addStatusBarItem();let t=Date.now();await this.updateSyncStatus(this.settings.a1Cookie?k(t):{...k(t),phase:"not_logged_in",message:"\u672A\u767B\u5F55"},{recordLog:!1}),this.addCommand({id:"xhs-vault-sync-login",name:"Log in to Xiaohongshu",callback:()=>this.openLoginModal()}),this.addCommand({id:"xhs-vault-sync-now",name:"Sync bookmarks now",callback:()=>{this.syncNow()}}),this.addCommand({id:"xhs-vault-sync-status",name:"Show sync status",callback:()=>this.openStatusModal()}),this.startSyncInterval(),this.openOnboardingModalAfterDelay()}async loadSettings(){let t=A(),n=await this.loadData();this.settings=Object.assign(t,n,{cookies:"",syncCursors:{...n?.syncCursors??{}},syncedIds:{...n?.syncedIds??{}},syncTargets:[...n?.syncTargets??t.syncTargets],downloadVideos:n?.downloadVideos??t.downloadVideos,allSynced:{...n?.allSynced??{}},albumWhitelist:{...n?.albumWhitelist??{}},bookmarkCateNextCursor:{...n?.bookmarkCateNextCursor??{}},cateSyncAllBookmark:{...n?.cateSyncAllBookmark??{}},perAccountState:{...n?.perAccountState??{}},syncStatusSnapshot:{...t.syncStatusSnapshot,...n?.syncStatusSnapshot??{},message:u(n?.syncStatusSnapshot?.message??t.syncStatusSnapshot.message),lastError:n?.syncStatusSnapshot?.lastError===void 0?void 0:u(n.syncStatusSnapshot.lastError)},syncLog:[...n?.syncLog??[]].map(s=>({...s,message:u(s.message)})),lastSyncError:u(n?.lastSyncError??t.lastSyncError),hasSeenOnboarding:n?.hasSeenOnboarding??t.hasSeenOnboarding})}async saveSettings(){await this.saveData(this.settings)}openLoginModal(){new R(this).open()}openStatusModal(){new H(this).open()}openOnboardingModalAfterDelay(){this.settings.hasSeenOnboarding||typeof window>"u"||window.setTimeout(()=>{this.isUnloaded||this.settings.hasSeenOnboarding||new D(this).open()},500)}async updateSyncStatus(t,n={}){if(this.isUnloaded)return;let s=Date.now(),r=this.settings.syncStatusSnapshot??k(s),i=u(t.message),o=t.lastError===void 0?void 0:u(t.lastError),c={...r,...t,message:i,updatedAt:s};o!==void 0&&(c.lastError=o),this.settings.syncStatusSnapshot=c,n.recordLog!==!1&&(this.settings.syncLog=te(this.settings.syncLog??[],{time:s,phase:c.phase,message:c.message})),this.statusBarEl?.setText(T(c)),await this.saveSettings()}async syncNow(){if(!this.isUnloaded){if(!this.settings.a1Cookie){new F.Notice("\u8BF7\u5148\u767B\u5F55\u5C0F\u7EA2\u4E66\uFF0C\u518D\u6267\u884C\u540C\u6B65\u3002");return}if(!this.isSyncing){this.isSyncing=!0;try{await this.syncEngine?.syncBookmarks()}finally{this.isSyncing=!1}}}}startSyncInterval(){if(this.stopSyncInterval(),!this.settings.autoSyncEnabled)return;let t=Math.max(5,this.settings.syncIntervalMinutes);this.syncIntervalId=this.registerInterval(window.setInterval(()=>{this.syncNow()},t*60*1e3))}stopSyncInterval(){this.syncIntervalId!==null&&(window.clearInterval(this.syncIntervalId),this.syncIntervalId=null)}onunload(){this.isUnloaded=!0,this.stopSyncInterval()}};
