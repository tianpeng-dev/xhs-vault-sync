/* XHS Vault Sync */
var Q=Object.defineProperty;var ke=Object.getOwnPropertyDescriptor;var be=Object.getOwnPropertyNames;var xe=Object.prototype.hasOwnProperty;var _e=(e,t)=>{for(var n in t)Q(e,n,{get:t[n],enumerable:!0})},Ae=(e,t,n,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of be(t))!xe.call(e,o)&&o!==n&&Q(e,o,{get:()=>t[o],enumerable:!(r=ke(t,o))||r.enumerable});return e};var Ee=e=>Ae(Q({},"__esModule",{value:!0}),e);var Nt={};_e(Nt,{default:()=>q});module.exports=Ee(Nt);var _=require("obsidian");var Ie=/\b(cookie|token|xsec|xsec_token|a1|web_session|id_token)\s*=\s*[^\s&]+/gi,Ce=/(["']?\b(cookie|token|xsec|xsec_token|a1|web_session|id_token)\b["']?\s*:\s*)["']?[^"',\s}]+["']?/gi,Te=/\bauthorization\s*:\s*bearer\s+[^\s,}]+/gi;function E(e=0){return{phase:"idle",message:"\u7B49\u5F85\u540C\u6B65",updatedAt:e,discoveredCount:0,savedCount:0,skippedCount:0}}function m(e){return e.replace(Ie,(t,n)=>`${n}=[redacted]`).replace(Ce,(t,n)=>{let r=n.trimStart().startsWith('"');return`${n}${r?'"[redacted]"':"[redacted]"}`}).replace(Te,"authorization: bearer [redacted]")}function le(e,t){return[...e,{...t,message:m(t.message)}].slice(-50)}function O(e){let t=m(e.message||"\u7B49\u5F85\u540C\u6B65");switch(e.phase){case"not_logged_in":return"\u5C0F\u7EA2\u4E66\uFF1A\u672A\u767B\u5F55";case"idle":return`\u5C0F\u7EA2\u4E66\uFF1A${t}`;case"opening_xhs":return"\u5C0F\u7EA2\u4E66\uFF1A\u6B63\u5728\u6253\u5F00\u5C0F\u7EA2\u4E66";case"collecting":return`\u5C0F\u7EA2\u4E66\uFF1A\u6B63\u5728\u8BFB\u53D6\u6536\u85CF\uFF08\u5DF2\u53D1\u73B0 ${e.discoveredCount} \u6761\uFF09`;case"saving":return`\u5C0F\u7EA2\u4E66\uFF1A\u6B63\u5728\u4FDD\u5B58 ${e.currentIndex??e.savedCount} / ${e.totalCount??e.discoveredCount}`;case"complete":return`\u5C0F\u7EA2\u4E66\uFF1A\u540C\u6B65\u5B8C\u6210\uFF08\u5DF2\u4FDD\u5B58 ${e.savedCount} \u6761\uFF0C\u5DF2\u8DF3\u8FC7 ${e.skippedCount} \u6761\uFF09`;case"failed":return`\u5C0F\u7EA2\u4E66\uFF1A\u540C\u6B65\u5931\u8D25\uFF1A${m(e.lastError||e.message||"\u672A\u77E5\u9519\u8BEF")}`}}function M(){return{rootFolder:"RedNote",autoSyncEnabled:!1,syncIntervalMinutes:10,syncBatchSize:5,activeSyncTarget:"bookmark",syncTargets:["bookmark"],downloadImages:!0,downloadVideos:!1,cookies:"",a1Cookie:"",userId:"",userName:"",syncCursors:{},syncedIds:{},allSynced:{},albumWhitelist:{},lastAlbumSnapshot:[],bookmarkCateNextCursor:{},cateSyncAllBookmark:{},perAccountState:{},nextSyncIndex:1,lastSyncAt:0,hasSeenOnboarding:!1,syncStatusSnapshot:E(),syncLog:[],lastSyncError:"",lastBookmarkDebug:void 0}}var Lt=M();function Ne(){return{syncCursors:{},syncedIds:{},allSynced:{},albumWhitelist:{},lastAlbumSnapshot:[],bookmarkCateNextCursor:{},cateSyncAllBookmark:{},nextSyncIndex:1}}function Be(e){return{syncCursors:{...e.syncCursors},syncedIds:{...e.syncedIds},allSynced:{...e.allSynced},albumWhitelist:{...e.albumWhitelist},lastAlbumSnapshot:[...e.lastAlbumSnapshot],bookmarkCateNextCursor:{...e.bookmarkCateNextCursor},cateSyncAllBookmark:{...e.cateSyncAllBookmark},nextSyncIndex:e.nextSyncIndex??1}}function ue(e,t){let n=t??Ne();e.syncCursors={...n.syncCursors},e.syncedIds={...n.syncedIds},e.allSynced={...n.allSynced},e.albumWhitelist={...n.albumWhitelist},e.lastAlbumSnapshot=[...n.lastAlbumSnapshot],e.bookmarkCateNextCursor={...n.bookmarkCateNextCursor},e.cateSyncAllBookmark={...n.cateSyncAllBookmark},e.nextSyncIndex=n.nextSyncIndex??1}function R(e,t){let n=e.userId;if(!n){let r=e.perAccountState[t.userId];r&&ue(e,r),e.userId=t.userId,e.userName=t.userName;return}n&&n!==t.userId&&(e.perAccountState[n]=Be(e)),n!==t.userId&&ue(e,e.perAccountState[t.userId]),e.userId=t.userId,e.userName=t.userName}var j=require("obsidian");var p=require("obsidian");var Pe=/[\\/:*?"<>|#^[\]]/g;function U(e,t="Untitled"){let n=e.replace(Pe," ").replace(/\s+/g," ").trim();return!n||n==="."||n===".."?t.slice(0,120):n.slice(0,120)}function I(...e){return e.flatMap(t=>t.replace(/^\/+|\/+$/g,"").split("/")).filter(t=>t&&t!=="."&&t!=="..").join("/")}function f(e){return JSON.stringify(e)}function Xe(e){return e.replace(/[\[\]]+/g," ").trim()}function Le(e){return e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function $e(e){try{let t=new URL(e);return t.protocol!=="http:"&&t.protocol!=="https:"?void 0:t.href.replace(/\)/g,"%29")}catch{return}}function Oe(e){return e.replace(/\r\n/g,`
`).replace(/\n{3,}/g,`

`).trim()}function Me(e){return e.trim()==="\u95EE\u4E00\u95EE"}function de(e){let t=e.tags.map(o=>`  - ${f(o)}`).join(`
`),n=e.media.map(o=>{if(o.localPath&&o.type==="image")return`![[${Xe(o.localPath)}]]`;if(o.localPath&&o.type==="video")return`<video controls src="${Le(o.localPath)}"></video>`;let s=$e(o.url);return s?`[${o.type} link](${s})`:`[${o.type} link unavailable]`}).join(`

`),r=(e.comments??[]).filter(o=>Me(o.author)).filter(o=>o.content.trim()).map((o,s)=>[`### \u56DE\u7B54 ${s+1}`,"",Oe(o.content)].join(`
`)).join(`

`);return["---",`source: ${f("xiaohongshu")}`,`resourceId: ${f(e.id)}`,`title: ${f(e.title)}`,`author: ${f(e.author)}`,`url: ${f(e.url)}`,e.syncTarget?`syncTarget: ${f(e.syncTarget)}`:void 0,e.albumId?`albumId: ${f(e.albumId)}`:void 0,e.albumTitle?`albumTitle: ${f(e.albumTitle)}`:void 0,e.syncIndex?`syncIndex: ${e.syncIndex}`:void 0,e.syncedAt?`syncedAt: ${f(e.syncedAt)}`:void 0,e.createdAt?`createdAt: ${f(e.createdAt)}`:void 0,e.updatedAt?`updatedAt: ${f(e.updatedAt)}`:void 0,"tags:",t||'  - "xhs"',"---","",`# ${e.title||"Untitled"}`,"",e.content||"(No content)","",n||void 0,r?"## \u95EE\u4E00\u95EE\u56DE\u7B54":void 0,r?"":void 0,r||void 0].filter(o=>o!==void 0).join(`
`).trimEnd().concat(`
`)}var D=class{constructor(t,n){this.app=t;this.rootFolder=n}app;rootFolder;async ensureFolder(t){let n=(0,p.normalizePath)(t),r=this.app.vault.getAbstractFileByPath(n);if(r instanceof p.TFolder)return;if(r)throw new Error(`Vault path exists but is not a folder: ${n}`);let o=n.split("/").slice(0,-1).join("/");o&&await this.ensureFolder(o),await this.app.vault.createFolder(n)}async writeNote(t){await this.ensureFolder(this.rootFolder);let n=t.syncIndex?`${String(t.syncIndex).padStart(4,"0")}-`:"",r=`${U(`${n}${t.title||"Untitled"}-${t.id}`)}.md`,o=(0,p.normalizePath)(I(this.rootFolder,r)),s=de(t),i=this.app.vault.getAbstractFileByPath(o);if(i instanceof p.TFile)await this.app.vault.modify(i,s);else{if(i)throw new Error(`Vault path exists but is not a file: ${o}`);await this.app.vault.create(o,s)}return o}async writeMedia(t,n,r,o){let s=(0,p.normalizePath)(I(this.rootFolder,"Media",U(t)));await this.ensureFolder(s);let i=(0,p.normalizePath)(I(s,`image-${n}.${o||"jpg"}`)),a=this.app.vault.getAbstractFileByPath(i);if(a instanceof p.TFile)await this.app.vault.delete(a);else if(a)throw new Error(`Vault path exists but is not a file: ${i}`);return await this.app.vault.createBinary(i,r),i}async writeVideo(t,n,r,o){let s=(0,p.normalizePath)(I(this.rootFolder,"Media",U(t)));await this.ensureFolder(s);let i=(0,p.normalizePath)(I(s,`video-${n}.${o||"mp4"}`)),a=this.app.vault.getAbstractFileByPath(i);if(a instanceof p.TFile)await this.app.vault.delete(a);else if(a)throw new Error(`Vault path exists but is not a file: ${i}`);return await this.app.vault.createBinary(i,r),i}};var te=require("obsidian");var d={web:"https://www.xiaohongshu.com",explore:"https://www.xiaohongshu.com/explore",api:"https://edith.xiaohongshu.com"};var Re="/api/sns/web/v2/user/me",Ue="/api/sns/web/v2/note/collect/page",De="/api/sns/web/v1/user/posted",Ve="/api/sns/web/v1/user/liked",je="/api/sns/web/v1/user/collect/board",He="/api/sns/web/v1/note/collect/board/page",Fe="/api/sns/web/v1/feed";function y(e){if(!(typeof e!="string"&&typeof e!="number"&&typeof e!="boolean"))return String(e).replace(/[A-Za-z0-9_-]{16,}/g,"[redacted]").slice(0,120)}function ge(e){return e!=null&&String(e)!=="0"}function We(e){return e.trim().toLowerCase()==="sorry, this page isn't available right now."}function x(e){return!!(e&&typeof e=="object")}function pe(e){if(typeof e!="string")return"";let t=e.trim();return/^https?:\/\//.test(t)?t:""}function V(e){for(let t of e){let n=pe(t);if(n)return n;if(Array.isArray(t)){let r=V(t);if(r)return r}}return""}function L(e,t,n=0){if(n>8||!x(e))return;let r=V([e.master_url,e.masterUrl,e.backup_urls,e.backupUrls]);r&&!t.includes(r)&&t.push(r);let o=x(e.media)?e.media:void 0,s=x(o?.stream)?o.stream:x(e.stream)?e.stream:void 0,i=[s?.h264,s?.h265].filter(Boolean);for(let a of i)Array.isArray(a)?a.forEach(l=>L(l,t,n+1)):L(a,t,n+1);for(let a of["video","videoInfo","video_info","media","stream"]){let l=e[a];l&&l!==e&&(Array.isArray(l)?l.forEach(u=>L(u,t,n+1)):L(l,t,n+1))}}function Ke(e){if(!x(e))return[];let t=[];return[e.video,e.videoInfo,e.video_info].forEach(n=>L(n,t)),t.map(n=>({type:"video",url:n,ext:"mp4"}))}var C=class{constructor(t,n){this.signer=t;this.cookies=n}signer;cookies;async getCurrentUser(){let n=(await this.signedGet(Re)).data;if(!n?.user_id||n.guest)throw new Error("Not logged in");return{userId:n.user_id,userName:n.nickname??""}}async getBookmarks(t,n,r){let o=new URLSearchParams({user_id:t,cursor:n,num:String(r),image_formats:"jpg,webp,avif"}),s=await this.signedGet(`${Ue}?${o.toString()}`);ee("bookmark",s);let i=s.data?.notes??[];return{notes:i.map(l=>({noteId:l.note_id??l.id??"",xsecToken:l.xsec_token??""})).filter(l=>l.noteId),cursor:s.data?.cursor??"",hasMore:!!s.data?.has_more,debug:{topLevelKeys:Object.keys(s).sort(),dataKeys:Object.keys(s.data??{}).sort(),noteCount:i.length,hasMore:!!s.data?.has_more,cursorPresent:!!s.data?.cursor,codeType:typeof s.code,codeValue:y(s.code),messagePresent:!!(s.msg||s.message),messagePreview:y(s.msg||s.message)}}}async getUserPosts(t,n,r){return this.getUserList("post",De,t,n,r)}async getUserLikes(t,n,r){return this.getUserList("like",Ve,t,n,r)}async getUserBoards(t){let n=new URLSearchParams({user_id:t}),r=await this.signedGet(`${je}?${n.toString()}`);return Je(r),ze(r)}async getBoardNotes(t,n,r){let o=new URLSearchParams({board_id:t,cursor:n,num:String(r),image_formats:"jpg,webp,avif"}),s=await this.signedGet(`${He}?${o.toString()}`);return ee("album",s),me(s)}async getNoteDetail(t,n){let r={source_note_id:t,image_formats:["jpg","webp","avif"],extra:{need_body_topic:"1"},xsec_source:"pc_collect",xsec_token:n},s=(await this.signedPost(Fe,r)).data?.items?.[0]?.note_card;if(!s)return null;let i=s.display_title??s.title??"Untitled",a=s.desc??"";if(We(i)&&!a.trim())return null;let l=(s.image_list??[]).map(c=>({type:"image",url:c.url_default??c.url??c.info_list?.[0]?.url??"",ext:"jpg"})).filter(c=>c.url),u=Ke(s),S=(s.comment_list??s.comments??[]).map(c=>({author:c.user?.nickname??c.user?.nick_name??c.user?.name??"",content:c.content??c.text??"",createdAt:c.create_time||c.time?new Date(c.create_time??c.time??0).toISOString():void 0,likes:c.like_count==null?void 0:String(c.like_count)})).filter(c=>c.content.trim());return{id:s.note_id??t,title:i,author:s.user?.nickname??"",url:`${d.web}/explore/${t}?xsec_token=${encodeURIComponent(n)}`,tags:(s.tag_list??[]).map(c=>c.name??"").filter(Boolean),content:a,createdAt:s.time?new Date(s.time).toISOString():void 0,updatedAt:s.last_update_time?new Date(s.last_update_time).toISOString():void 0,media:[...l,...u],comments:S}}async signedGet(t){if(this.signer.signedFetchJson)return this.signer.signedFetchJson("GET",t);let n=await this.signer.sign(t),r=await(0,te.requestUrl)({url:`${d.api}${t}`,method:"GET",headers:{...n,"Content-Type":"application/json",Cookie:this.cookies,Origin:d.web,Referer:`${d.web}/`},throw:!1});if(r.status>=400)throw new Error(`XHS HTTP ${r.status}`);return r.json}async getUserList(t,n,r,o,s){let i=new URLSearchParams({user_id:r,cursor:o,num:String(s),image_formats:"jpg,webp,avif"}),a=await this.signedGet(`${n}?${i.toString()}`);return ee(t,a),me(a)}async signedPost(t,n){if(this.signer.signedFetchJson)return this.signer.signedFetchJson("POST",t,n);let r=await this.signer.sign(t,n),o=await(0,te.requestUrl)({url:`${d.api}${t}`,method:"POST",headers:{...r,"Content-Type":"application/json",Cookie:this.cookies,Origin:d.web,Referer:`${d.web}/`},body:JSON.stringify(n),throw:!1});if(o.status>=400)throw new Error(`XHS HTTP ${o.status}`);return o.json}};function ee(e,t){let n=y(t.msg||t.message);if(!Array.isArray(t.data?.notes)&&(n||ge(t.code)))throw new Error(`XHS ${e} API rejected: ${n||y(t.code)||"unknown error"}`)}function Je(e){let t=he(e),n=y(e.msg||e.message);if(!Array.isArray(t)&&(n||ge(e.code)))throw new Error(`XHS board API rejected: ${n||y(e.code)||"unknown error"}`)}function ze(e){return(he(e)??[]).map(n=>({id:n.board_id??n.id??n.collect_id??"",title:n.name??n.title??n.collect_name??"",noteCount:qe(n.note_count??n.noteCount??n.notes_count)})).filter(n=>n.id&&n.title)}function he(e){return Array.isArray(e.data)?e.data:e.data?.boards??e.data?.board_list??e.data?.collects??e.data?.list??e.data?.items}function qe(e){let t=typeof e=="string"?Number(e):e;if(typeof t=="number")return Number.isFinite(t)?t:void 0}function me(e){let t=e.data?.notes??[];return{notes:t.map(Ge).filter(r=>r.noteId),cursor:e.data?.cursor??"",hasMore:!!e.data?.has_more,debug:{topLevelKeys:Object.keys(e).sort(),dataKeys:Object.keys(e.data??{}).sort(),noteCount:t.length,hasMore:!!e.data?.has_more,cursorPresent:!!e.data?.cursor,codeType:typeof e.code,codeValue:y(e.code),messagePresent:!!(e.msg||e.message),messagePreview:y(e.msg||e.message)}}}function Ge(e){let t=e.note_card??e;return{noteId:t.note_id??t.id??"",xsecToken:t.xsec_token??e.xsec_token??"",title:t.display_title??t.title??t.desc,author:Ye(t.user??e.user??e.author),coverUrl:Ze(t.cover??t.cover_url??t.image_list??e.cover??e.cover_url??e.image_list),noteType:t.note_type??t.type??e.note_type??e.type}}function Ye(e){if(typeof e=="string")return e;if(x(e))return y(e.nickname??e.nick_name??e.name)}function Ze(e){if(typeof e=="string")return pe(e)||void 0;if(Array.isArray(e))return V(e)||void 0;if(x(e))return V([e.url_default,e.url,e.info_list])||void 0}var T="persist:xhs-vault-sync";function Qe(e){let t=new Map;for(let n of e.split(";")){let r=n.trim();if(!r)continue;let o=r.indexOf("=");o<=0||t.set(r.slice(0,o),r.slice(o+1))}return t}function et(e,t){let n=Qe(e);for(let r of t)!r.name||!r.value||n.set(r.name,r.value);return Array.from(n.entries()).map(([r,o])=>`${r}=${o}`).join("; ")}function tt(){let e=require("electron");return e.session?.fromPartition(T)??e.remote?.session?.fromPartition(T)??null}async function N(e){let t=tt();if(!t)return e;let[n,r]=await Promise.all([t.cookies.get({domain:"xiaohongshu.com"}),t.cookies.get({url:d.api})]);return et(e,[...n,...r])}var B=class{webviewEl=null;ready=!1;async initWebview(){if(this.ready&&this.webviewEl)return;let t=document.createElement("webview");t.setAttribute("src",d.explore),t.setAttribute("partition",T),t.setAttribute("allowpopups","false"),t.setAttribute("style","position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;"),document.body.appendChild(t),this.webviewEl=t;try{await new Promise((n,r)=>{let o=window.setTimeout(()=>r(new Error("Webview load timeout")),3e4);t.addEventListener("did-finish-load",()=>{window.clearTimeout(o),this.ready=!0,n()}),t.addEventListener("did-fail-load",()=>{window.clearTimeout(o),r(new Error("Webview failed to load"))})})}catch(n){throw this.destroy(),n}}async loadUrl(t){if(!this.webviewEl)throw new Error("Sign webview is not ready");await new Promise((n,r)=>{let o=window.setTimeout(()=>r(new Error("Webview load timeout")),3e4),s=()=>{window.clearTimeout(o),this.webviewEl?.removeEventListener("did-finish-load",i),this.webviewEl?.removeEventListener("did-fail-load",a)},i=()=>{s(),n()},a=()=>{s(),r(new Error("Webview failed to load"))};this.webviewEl?.addEventListener("did-finish-load",i),this.webviewEl?.addEventListener("did-fail-load",a),this.webviewEl?.setAttribute("src",t)})}destroy(){this.webviewEl?.parentElement?.removeChild(this.webviewEl),this.webviewEl=null,this.ready=!1}async sign(t,n){if(!this.webviewEl?.executeJavaScript)throw new Error("Sign webview is not ready");let r=this.buildInjectScript(t,n??null),o=await this.webviewEl.executeJavaScript(r);if(!o)throw new Error("Sign inject returned no result");if(o.error)throw new Error(`Sign inject failed: ${o.error}`);if(!o["x-s"]||!o["x-t"]||!o["x-s-common"]||!o["x-b3-traceid"])throw new Error("Sign inject returned incomplete headers");return o}async signedFetchJson(t,n,r){if(!this.webviewEl?.executeJavaScript)throw new Error("Sign webview is not ready");let o=this.buildFetchScript(t,n,r??null),s=await this.webviewEl.executeJavaScript(o);if(!s)throw new Error("Webview fetch returned no result");if(s.error)throw new Error(`Webview fetch failed: ${s.error}`);if((s.status??0)>=400)throw new Error(`XHS HTTP ${s.status}`);return s.json}async collectBookmarks(t,n){if(await this.loadUrl(`${d.web}/user/profile/${encodeURIComponent(t)}`),!this.webviewEl?.executeJavaScript)throw new Error("Sign webview is not ready");let r=await this.webviewEl.executeJavaScript(this.buildBookmarkCollectorScript(n));if(!r)throw new Error("Bookmark collector returned no result");return r}async collectNoteDetail(t){let n=t.xsecToken?`${d.web}/explore/${encodeURIComponent(t.noteId)}?xsec_token=${encodeURIComponent(t.xsecToken)}`:`${d.web}/explore/${encodeURIComponent(t.noteId)}`;if(await this.loadUrl(n),!this.webviewEl?.executeJavaScript)throw new Error("Sign webview is not ready");let r=await this.webviewEl.executeJavaScript(this.buildNoteDetailCollectorScript(t));return nt(r)||!r?.content?.trim()&&!r?.media?.length&&!r?.comments?.length?null:r}buildInjectScript(t,n){return`
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
    `}buildFetchScript(t,n,r){return`
      (async function() {
        try {
          var apiPath = ${JSON.stringify(n)};
          var apiData = ${JSON.stringify(r)};
          var method = ${JSON.stringify(t)};
          var headers = (${this.buildInjectScript(n,r)});
          if (headers.error) return { error: headers.error };
          var response = await fetch(${JSON.stringify(d.api)} + apiPath, {
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
    `}buildNoteDetailCollectorScript(t){let n=t.noteId,r=t.xsecToken;return`
      (function() {
        var NOTE_ID = ${JSON.stringify(n)};
        var FALLBACK = ${JSON.stringify(t)};
        var XHS_WEB = ${JSON.stringify(d.web)};

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

        function collectVideos(card) {
          var videos = [];
          function add(url) {
            if (!url) return;
            var text = String(url).trim();
            if (!/^https?:\\/\\//.test(text)) return;
            if (videos.indexOf(text) === -1) videos.push(text);
          }
          function first(values) {
            for (var index = 0; index < values.length; index++) {
              var value = unwrap(values[index]);
              if (!value) continue;
              if (Array.isArray(value)) {
                for (var nestedIndex = 0; nestedIndex < value.length; nestedIndex++) {
                  var nested = first([value[nestedIndex]]);
                  if (nested) return nested;
                }
                continue;
              }
              if (typeof value === "string" && /^https?:\\/\\//.test(value.trim())) return value.trim();
            }
            return "";
          }
          function scan(value, depth) {
            value = unwrap(value);
            var nextDepth = depth || 0;
            if (nextDepth > 8 || !value || typeof value !== "object") return;
            add(first([value.master_url, value.masterUrl, value.backup_urls, value.backupUrls]));
            var media = unwrap(value.media) || {};
            var stream = unwrap(media.stream) || unwrap(value.stream) || {};
            [stream.h264, stream.h265].forEach(function(streamValue) {
              streamValue = unwrap(streamValue);
              if (Array.isArray(streamValue)) streamValue.forEach(function(entry) { scan(entry, nextDepth + 1); });
              else scan(streamValue, nextDepth + 1);
            });
            ["video", "videoInfo", "video_info", "media", "stream"].forEach(function(key) {
              var child = value[key];
              if (!child || child === value) return;
              child = unwrap(child);
              if (Array.isArray(child)) child.forEach(function(entry) { scan(entry, nextDepth + 1); });
              else scan(child, nextDepth + 1);
            });
          }

          scan(card && (card.video || card.videoInfo || card.video_info), 0);
          [card && card.video, card && card.videoInfo, card && card.video_info].forEach(function(value) { scan(value, 0); });
          Array.from(document.querySelectorAll('video[src], source[src]')).forEach(function(element) {
            add(element.getAttribute("src") || element.src || "");
          });

          return videos.slice(0, 10).map(function(url) {
            return { type: "video", url: url, ext: "mp4" };
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
          media: collectImages(card).concat(collectVideos(card)),
          comments: collectComments(card)
        };
      })()
    `}};function nt(e){return rt(e?.title)&&!e?.content?.trim()}function rt(e){return e?.trim().toLowerCase()==="sorry, this page isn't available right now."}var fe=require("obsidian");function st(e){return e.ext?e.ext:e.type==="video"?"mp4":"jpg"}function ot(e){return e.startsWith("http://")?`https://${e.slice(7)}`:e}async function ye(e){let t=st(e);try{let n=await(0,fe.requestUrl)({url:ot(e.url),method:"GET",throw:!1,...e.type==="video"?{headers:{Range:"bytes=0-"}}:{}});return n.status<200||n.status>=300?{ext:t,error:`HTTP ${n.status}`}:{ext:t,data:n.arrayBuffer}}catch(n){let r=n instanceof Error?n.message:String(n);return{ext:t,error:r}}}function it(e,t){return e[t]!==!0}function at(e,t){e[t]=!0}var H=class{constructor(t){this.plugin=t}plugin;isSyncing=!1;async syncBookmarks(){if(this.isSyncing){new j.Notice("XHS sync is already running.");return}this.isSyncing=!0;let t=new B;try{await this.plugin.updateSyncStatus({phase:"opening_xhs",message:"\u6B63\u5728\u6253\u5F00\u5C0F\u7EA2\u4E66\u9875\u9762",startedAt:Date.now(),discoveredCount:0,savedCount:0,skippedCount:0}),await t.initWebview();let n=`a1=${this.plugin.settings.a1Cookie}`,r=await N(n);this.plugin.settings.cookies="";let o=new C(t,r),s=new D(this.plugin.app,this.plugin.settings.rootFolder),i=await o.getCurrentUser();R(this.plugin.settings,i);let a=this.plugin.settings.activeSyncTarget??"bookmark",l=pt(a);await this.plugin.updateSyncStatus({phase:"collecting",message:`\u6B63\u5728\u8BFB\u53D6${l}`,discoveredCount:0,savedCount:0,skippedCount:0});let u=Math.max(30,this.plugin.settings.syncBatchSize),S=a==="album"?await yt(o,i.userId,this.plugin.settings,u):null,c=S?.page??await ft(a,o,t,i.userId,this.plugin.settings.syncCursors[a]??"",u);this.plugin.settings.lastBookmarkDebug=c.debug;let k=0,v=0,G=0,Y=!1,oe=Math.min(c.notes.length,this.plugin.settings.syncBatchSize);await this.plugin.updateSyncStatus({phase:"saving",message:"\u6B63\u5728\u4FDD\u5B58",discoveredCount:c.notes.length,savedCount:k,skippedCount:v,currentIndex:G,totalCount:oe});for(let w of c.notes){let ie=ht(a,w);if(!it(this.plugin.settings.syncedIds,ie)){v++;continue}G++,await this.plugin.updateSyncStatus({phase:"saving",message:"\u6B63\u5728\u4FDD\u5B58",discoveredCount:c.notes.length,savedCount:k,skippedCount:v,currentIndex:G,totalCount:oe});let $=await o.getNoteDetail(w.noteId,w.xsecToken),Z=lt($)?await t.collectNoteDetail(w):null,ae=ne(Z)?null:Z;if(!$&&ne(Z)){v++;continue}if(bt(w)&&!$&&!ae){v++;continue}let g=ut($,ae)??xt(w);if(ne(g)){v++;continue}g.comments=re(g.comments),g.syncTarget=a,a==="album"&&(g.albumId=w.albumId??S?.album?.id,g.albumTitle=w.albumTitle??S?.album?.title);for(let X=0;X<g.media.length;X++){let A=g.media[X];if(A.type==="image"&&!this.plugin.settings.downloadImages||A.type==="video"&&!this.plugin.settings.downloadVideos)continue;let b=await ye(A);b.data?A.localPath=A.type==="video"?await s.writeVideo(g.id,X+1,b.data,b.ext):await s.writeMedia(g.id,X+1,b.data,b.ext):b.error&&(A.downloadError=b.error)}let ce=this.plugin.settings.nextSyncIndex??1;if(g.syncIndex=ce,g.syncedAt=new Date().toISOString(),await s.writeNote(g),this.plugin.settings.nextSyncIndex=ce+1,at(this.plugin.settings.syncedIds,ie),k++,k>=this.plugin.settings.syncBatchSize){Y=!0;break}}!Y&&S?.album?(this.plugin.settings.bookmarkCateNextCursor[S.album.id]=c.cursor,c.hasMore||(this.plugin.settings.cateSyncAllBookmark[S.album.id]=!0)):Y||(this.plugin.settings.syncCursors[a]=c.cursor),this.plugin.settings.lastSyncAt=Date.now(),this.plugin.settings.lastSyncError="",await this.plugin.updateSyncStatus({phase:"complete",message:`\u540C\u6B65\u5B8C\u6210\uFF0C\u65B0\u589E ${k} \u6761\uFF0C\u8DF3\u8FC7 ${v} \u6761`,discoveredCount:c.notes.length,savedCount:k,skippedCount:v,lastError:""}),await this.plugin.saveSettings(),new j.Notice(`XHS sync complete: ${k} notes saved.`)}catch(n){let r=n instanceof Error?n.message:String(n),o=m(kt(r));throw this.plugin.settings.lastSyncError=o,await this.plugin.updateSyncStatus({phase:"failed",message:o,lastError:o,discoveredCount:this.plugin.settings.syncStatusSnapshot?.discoveredCount??0,savedCount:this.plugin.settings.syncStatusSnapshot?.savedCount??0,skippedCount:this.plugin.settings.syncStatusSnapshot?.skippedCount??0}),new j.Notice(`XHS sync failed: ${o}`),n}finally{t.destroy(),this.isSyncing=!1}}};function ct(e){return!!e?.content?.trim()}function lt(e){return!ct(e)||e.media.length===0||!dt(e.comments)}function ut(e,t){return e?t?{...e,...t,title:t.title||e.title,author:t.author||e.author,tags:t.tags.length?t.tags:e.tags,content:t.content||e.content,media:t.media.length?t.media:e.media,comments:mt(e.comments,t.comments)}:e:t}function Se(e){return e.author.trim()==="\u95EE\u4E00\u95EE"&&!!e.content.trim()}function dt(e){return!!e?.some(Se)}function re(e){return(e??[]).filter(Se)}function mt(e,t){let n=re(t);return n.length?n:re(e)}function gt(e,t){let n=new Map(t.notes.map(s=>[s.noteId,s])),r=e.notes.map(s=>{let i=n.get(s.noteId);return i?{...i,...s,xsecToken:s.xsecToken||i.xsecToken,title:i.title||s.title,author:i.author||s.author,coverUrl:i.coverUrl||s.coverUrl,noteType:i.noteType||s.noteType}:s}),o=new Set(e.notes.map(s=>s.noteId));for(let s of t.notes)o.has(s.noteId)||r.push(s);return{notes:r,cursor:e.cursor||t.cursor,hasMore:e.hasMore||t.hasMore,debug:{...e.debug,noteCount:r.length,sourceSummary:[e.debug.sourceSummary,t.debug.sourceSummary,`api=${e.notes.length}`,`page=${t.notes.length}`].filter(Boolean).join(","),itemKeySummary:t.debug.itemKeySummary||e.debug.itemKeySummary,cardKeySummary:t.debug.cardKeySummary||e.debug.cardKeySummary}}}function pt(e){return e==="post"?"\u6211\u7684\u7B14\u8BB0":e==="like"?"\u70B9\u8D5E":e==="album"?"\u4E13\u8F91":"\u6536\u85CF"}function ht(e,t){return e==="bookmark"?t.noteId:e==="album"?`album:${t.albumId??""}:${t.noteId}`:`${e}:${t.noteId}`}async function ft(e,t,n,r,o,s){if(e==="bookmark"){let i=await wt(t,r,o,s),a=await vt(n,r,s);return gt(i,a)}if(e==="post")return t.getUserPosts(r,o,s);if(e==="like")return t.getUserLikes(r,o,s);throw new Error("\u4E13\u8F91\u540C\u6B65\u5C1A\u672A\u5B9E\u73B0")}async function yt(e,t,n,r){let o=await e.getUserBoards(t);n.lastAlbumSnapshot=o;let s=Object.keys(n.albumWhitelist).filter(u=>n.albumWhitelist[u]);if(!s.length)throw new Error("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u9009\u62E9\u81F3\u5C11\u4E00\u4E2A\u4E13\u8F91");let i=new Map(o.map(u=>[u.id,u])),a=s.map(u=>i.get(u)).find(u=>!!(u&&n.cateSyncAllBookmark[u.id]!==!0));if(!a)return{page:St("album-complete")};let l=await e.getBoardNotes(a.id,n.bookmarkCateNextCursor[a.id]??"",r);return{album:a,page:{...l,notes:l.notes.map(u=>({...u,albumId:a.id,albumTitle:a.title}))}}}function St(e){return{notes:[],cursor:"",hasMore:!1,debug:{topLevelKeys:[e],dataKeys:[],noteCount:0,hasMore:!1,cursorPresent:!1,codeType:e,messagePresent:!1}}}async function vt(e,t,n){try{return await e.collectBookmarks(t,n)}catch(r){let o=r instanceof Error?r.message:String(r);return{notes:[],cursor:"",hasMore:!1,debug:{topLevelKeys:["page-collector"],dataKeys:[],noteCount:0,hasMore:!1,cursorPresent:!1,codeType:"page-collector-error",messagePresent:!0,messagePreview:m(o)}}}}async function wt(e,t,n,r){try{return await e.getBookmarks(t,n,r)}catch(o){let s=o instanceof Error?o.message:String(o);return{notes:[],cursor:"",hasMore:!1,debug:{topLevelKeys:["api-collector"],dataKeys:[],noteCount:0,hasMore:!1,cursorPresent:!1,codeType:"api-collector-error",messagePresent:!0,messagePreview:m(s)}}}}function kt(e){return e.includes("Not logged in")?"\u767B\u5F55\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u5C0F\u7EA2\u4E66":e.includes("Webview load timeout")?"\u5C0F\u7EA2\u4E66\u9875\u9762\u52A0\u8F7D\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5":e.includes("HTTP 406")?"\u5C0F\u7EA2\u4E66\u62D2\u7EDD\u4E86\u5F53\u524D\u8BF7\u6C42\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u540E\u518D\u8BD5":e.includes("Account abnormal")||e.includes("300011")?"\u6536\u85CF\u63A5\u53E3\u88AB\u5C0F\u7EA2\u4E66\u62D2\u7EDD\uFF0C\u5DF2\u5C1D\u8BD5\u4F7F\u7528\u9875\u9762\u91C7\u96C6":e}function bt(e){return ve(e.title)}function ne(e){return ve(e?.title)&&!e?.content?.trim()}function ve(e){return e?.trim().toLowerCase()==="sorry, this page isn't available right now."}function xt(e){let t=e.xsecToken?`https://www.xiaohongshu.com/explore/${e.noteId}?xsec_token=${encodeURIComponent(e.xsecToken)}`:`https://www.xiaohongshu.com/explore/${e.noteId}`;return{id:e.noteId,title:e.title||`XHS Bookmark ${e.noteId.slice(0,8)}`,author:e.author||"",url:t,tags:["xhs","xhs-bookmark"],content:[e.noteType?`\u7C7B\u578B\uFF1A${e.noteType}`:void 0,"\u5DF2\u4ECE\u5C0F\u7EA2\u4E66\u6536\u85CF\u5217\u8868\u540C\u6B65\u3002\u5F53\u524D Web \u8BE6\u60C5\u63A5\u53E3\u672A\u8FD4\u56DE\u5B8C\u6574\u6B63\u6587\uFF0C\u56E0\u6B64\u672C\u7B14\u8BB0\u4FDD\u7559\u6536\u85CF\u9875\u53EF\u89C1\u4FE1\u606F\u4E0E\u539F\u59CB\u94FE\u63A5\u3002"].filter(Boolean).join(`

`),media:e.coverUrl?[{type:"image",url:e.coverUrl,ext:"jpg"}]:[]}}var P=require("obsidian");var F=class extends P.Modal{constructor(n){super(n.app);this.plugin=n}plugin;webviewEl=null;onOpen(){this.modalEl.addClass("xhs-login-modal"),this.contentEl.empty();let n=this.contentEl.createDiv({cls:"xhs-webview-container"}),r=document.createElement("webview");r.setAttribute("src",d.web),r.setAttribute("partition",T),r.setAttribute("allowpopups","true"),n.appendChild(r),this.webviewEl=r,this.contentEl.createDiv().createEl("button",{text:"I am logged in"}).addEventListener("click",()=>{this.handleLoginComplete()})}async handleLoginComplete(){if(!this.webviewEl?.executeJavaScript){new P.Notice("\u767B\u5F55\u7A97\u53E3\u5C1A\u672A\u51C6\u5907\u597D\u3002");return}let n=await this.webviewEl.executeJavaScript("document.cookie"),o=(await N(n)).match(/(?:^|;\s*)a1=([^;]+)/)?.[1]??"";if(!o){new P.Notice("\u672A\u627E\u5230 a1 Cookie\uFF0C\u8BF7\u5148\u5B8C\u6210\u767B\u5F55\u3002");return}this.plugin.settings.cookies="",this.plugin.settings.a1Cookie=o,await this.plugin.saveSettings(),await this.plugin.updateSyncStatus({phase:"idle",message:"\u767B\u5F55\u6210\u529F\uFF0C\u53EF\u4EE5\u5F00\u59CB\u540C\u6B65",discoveredCount:0,savedCount:0,skippedCount:0}),new P.Notice("\u5C0F\u7EA2\u4E66\u767B\u5F55\u5DF2\u4FDD\u5B58\u3002\u4E0B\u4E00\u6B65\u6267\u884C\u7ACB\u5373\u540C\u6B65\u4E66\u7B7E\u3002"),this.close()}onClose(){this.contentEl.empty(),this.webviewEl=null}};var K=require("obsidian"),W=class extends K.Modal{constructor(n){super(n.app);this.plugin=n}plugin;hasMarkedSeen=!1;onOpen(){let{contentEl:n}=this;this.markOnboardingSeen(),n.empty(),n.createEl("h2",{text:"\u5F00\u59CB\u540C\u6B65\u5C0F\u7EA2\u4E66\u6536\u85CF"});let r=n.createEl("ol");r.createEl("li",{text:"\u70B9\u51FB\u201C\u767B\u5F55\u5C0F\u7EA2\u4E66\u201D\uFF0C\u5728\u5F39\u7A97\u4E2D\u5B8C\u6210\u767B\u5F55\u3002"}),r.createEl("li",{text:"\u5728\u767B\u5F55\u5F39\u7A97\u70B9\u51FB\u5B8C\u6210\u767B\u5F55\u6309\u94AE\uFF08I am logged in\uFF09\u3002"}),r.createEl("li",{text:"\u70B9\u51FB\u201C\u7ACB\u5373\u540C\u6B65\u201D\uFF0C\u63D2\u4EF6\u4F1A\u628A\u6536\u85CF\u4FDD\u5B58\u5230 RedNote\u3002"}),r.createEl("li",{text:"\u540C\u6B65\u8FC7\u7A0B\u4E2D\u53EF\u4EE5\u5728\u72B6\u6001\u680F\u6216\u201C\u67E5\u770B\u72B6\u6001\u201D\u91CC\u770B\u8FDB\u5EA6\u3002"}),new K.Setting(n).addButton(o=>o.setButtonText("\u767B\u5F55\u5C0F\u7EA2\u4E66").setCta().onClick(async()=>{await this.markOnboardingSeen(),this.close(),this.plugin.openLoginModal()})).addButton(o=>o.setButtonText("\u7A0D\u540E\u518D\u8BF4").onClick(async()=>{await this.markOnboardingSeen(),this.close()}))}async markOnboardingSeen(){this.hasMarkedSeen||this.plugin.settings.hasSeenOnboarding||(this.hasMarkedSeen=!0,this.plugin.settings.hasSeenOnboarding=!0,await this.plugin.saveSettings())}onClose(){this.contentEl.empty()}};var h=require("obsidian"),J=class extends h.PluginSettingTab{constructor(n,r){super(n,r);this.plugin=r}plugin;display(){let{containerEl:n}=this;n.empty(),n.createEl("h2",{text:"XHS Vault Sync"}),n.createEl("h3",{text:"\u5F53\u524D\u72B6\u6001"}),n.createEl("p",{text:this.plugin.settings.a1Cookie?"\u767B\u5F55\u72B6\u6001\uFF1A\u5DF2\u4FDD\u5B58\u767B\u5F55\u6001":"\u767B\u5F55\u72B6\u6001\uFF1A\u672A\u767B\u5F55"}),n.createEl("p",{text:this.plugin.settings.lastSyncAt?`\u4E0A\u6B21\u540C\u6B65\uFF1A${new Date(this.plugin.settings.lastSyncAt).toLocaleString()}`:"\u4E0A\u6B21\u540C\u6B65\uFF1A\u6682\u65E0"}),n.createEl("p",{text:`\u5DF2\u540C\u6B65\uFF1A${Object.keys(this.plugin.settings.syncedIds).length} \u6761`});let r=!!this.plugin.settings.a1Cookie;new h.Setting(n).setName("\u64CD\u4F5C").setDesc(r?"\u767B\u5F55\u540E\u5373\u53EF\u540C\u6B65\u5C0F\u7EA2\u4E66\u6536\u85CF\u3002":"\u8BF7\u5148\u767B\u5F55\u5C0F\u7EA2\u4E66\uFF0C\u518D\u6267\u884C\u540C\u6B65\u3002").addButton(s=>s.setButtonText("\u767B\u5F55\u5C0F\u7EA2\u4E66").onClick(()=>{this.plugin.openLoginModal()})).addButton(s=>s.setButtonText("\u7ACB\u5373\u540C\u6B65").setCta().setDisabled(!r).onClick(()=>{this.plugin.syncNow()})).addButton(s=>s.setButtonText("\u67E5\u770B\u72B6\u6001").onClick(()=>{this.plugin.openStatusModal()})),new h.Setting(n).setName("\u81EA\u52A8\u540C\u6B65").setDesc("\u6309\u56FA\u5B9A\u95F4\u9694\u540C\u6B65\u6536\u85CF\uFF0C\u6700\u5C0F\u95F4\u9694\u4E3A 5 \u5206\u949F\u3002").addToggle(s=>s.setValue(this.plugin.settings.autoSyncEnabled).onChange(async i=>{this.plugin.settings.autoSyncEnabled=i,await this.plugin.saveSettings(),this.plugin.startSyncInterval()})),new h.Setting(n).setName("\u540C\u6B65\u95F4\u9694\uFF08\u5206\u949F\uFF09").setDesc("\u6700\u5C0F 5 \u5206\u949F\u3002").addText(s=>s.setValue(String(this.plugin.settings.syncIntervalMinutes)).onChange(async i=>{let a=Number(i);this.plugin.settings.syncIntervalMinutes=Number.isFinite(a)?Math.max(5,Math.floor(a)):10,await this.plugin.saveSettings(),this.plugin.startSyncInterval()})),new h.Setting(n).setName("\u4FDD\u5B58\u76EE\u5F55").setDesc("\u540C\u6B65\u7684 Markdown \u548C\u5A92\u4F53\u6587\u4EF6\u4F1A\u4FDD\u5B58\u5230\u6B64\u76EE\u5F55\u4E0B\u3002").addText(s=>s.setPlaceholder("RedNote").setValue(this.plugin.settings.rootFolder).onChange(async i=>{this.plugin.settings.rootFolder=i.trim()||"RedNote",await this.plugin.saveSettings()})),new h.Setting(n).setName("\u5355\u6B21\u540C\u6B65\u6570\u91CF").setDesc("\u6BCF\u6B21\u540C\u6B65\u7684\u7B14\u8BB0\u6570\u91CF\uFF0C\u8303\u56F4\u4E3A 1 \u5230 10\uFF0C\u964D\u4F4E\u89E6\u53D1\u9650\u6D41\u7684\u98CE\u9669\u3002").addText(s=>s.setPlaceholder("5").setValue(String(this.plugin.settings.syncBatchSize)).onChange(async i=>{let a=Number(i);this.plugin.settings.syncBatchSize=Number.isFinite(a)?Math.min(10,Math.max(1,Math.floor(a))):5,await this.plugin.saveSettings()})),new h.Setting(n).setName("\u540C\u6B65\u76EE\u6807").setDesc("\u9009\u62E9\u672C\u6B21\u540C\u6B65\u8BFB\u53D6\u7684\u4E2A\u4EBA\u6570\u636E\u6765\u6E90\u3002").addDropdown(s=>{s.addOption("bookmark","\u6536\u85CF").addOption("post","\u6211\u7684\u7B14\u8BB0").addOption("like","\u70B9\u8D5E").addOption("album","\u4E13\u8F91").setValue(this.plugin.settings.activeSyncTarget).onChange(async i=>{this.plugin.settings.activeSyncTarget=i,await this.plugin.saveSettings()})}),new h.Setting(n).setName("\u4E13\u8F91\u767D\u540D\u5355").setDesc("\u4EC5\u540C\u6B65\u5DF2\u9009\u62E9\u7684\u4E13\u8F91\u3002").addButton(s=>s.setButtonText("\u5237\u65B0\u4E13\u8F91\u5217\u8868").onClick(()=>{this.plugin.refreshAlbums()}));let o=this.plugin.settings.lastAlbumSnapshot??[];o.length||n.createEl("p",{text:"\u6682\u65E0\u4E13\u8F91\u5FEB\u7167\uFF0C\u8BF7\u5148\u5237\u65B0\u4E13\u8F91\u5217\u8868\u3002"});for(let s of o){let i=s.noteCount===void 0?"":`\uFF08${s.noteCount} \u6761\uFF09`;new h.Setting(n).setName(`${s.title}${i}`).setDesc(s.id).addToggle(a=>a.setValue(!!this.plugin.settings.albumWhitelist[s.id]).onChange(async l=>{l?this.plugin.settings.albumWhitelist[s.id]=!0:delete this.plugin.settings.albumWhitelist[s.id],await this.plugin.saveSettings()}))}new h.Setting(n).setName("\u4E0B\u8F7D\u56FE\u7247").setDesc("\u5C06\u7B14\u8BB0\u56FE\u7247\u4FDD\u5B58\u5230\u5E93\u4E2D\uFF0C\u800C\u4E0D\u662F\u5F15\u7528\u8FDC\u7A0B\u94FE\u63A5\u3002").addToggle(s=>s.setValue(this.plugin.settings.downloadImages).onChange(async i=>{this.plugin.settings.downloadImages=i,await this.plugin.saveSettings()})),new h.Setting(n).setName("\u4E0B\u8F7D\u89C6\u9891").setDesc("\u5C06\u89C6\u9891\u7B14\u8BB0\u4FDD\u5B58\u5230\u5E93\u4E2D\uFF0C\u800C\u4E0D\u662F\u5F15\u7528\u8FDC\u7A0B\u94FE\u63A5\u3002").addToggle(s=>s.setValue(this.plugin.settings.downloadVideos).onChange(async i=>{this.plugin.settings.downloadVideos=i,await this.plugin.saveSettings()}))}};var we=require("obsidian");var _t=/\s*\b(raw_response|rawResponse|originalResponse|原始响应)\b[\s\S]*$/i;function At(e,t){return e?new Date(e).toLocaleString():t}function Et(e){return m(e).replace(_t,"[response redacted]").trim()}var z=class extends we.Modal{constructor(n){super(n.app);this.plugin=n}plugin;onOpen(){let{contentEl:n}=this,{settings:r}=this.plugin,o=r.syncStatusSnapshot,s=Object.keys(r.syncedIds??{}).length,i=r.lastBookmarkDebug;n.empty(),n.createEl("h2",{text:"XHS Vault Sync \u72B6\u6001"}),n.createEl("p",{text:O(o)}),n.createEl("p",{text:`\u4E0A\u6B21\u540C\u6B65\uFF1A${At(r.lastSyncAt,"\u6682\u65E0")}`}),n.createEl("p",{text:`\u5DF2\u540C\u6B65\uFF1A${s} \u6761`}),n.createEl("p",{text:`\u4FDD\u5B58\u76EE\u5F55\uFF1A${r.rootFolder}`}),n.createEl("h3",{text:"\u6700\u8FD1\u91C7\u96C6\u6458\u8981"}),i?(n.createEl("p",{text:`\u5019\u9009\uFF1A${i.noteCount} \u6761`}),n.createEl("p",{text:`\u6765\u6E90\uFF1A${i.sourceSummary||"\u65E0"}`}),n.createEl("p",{text:`\u5E26\u8BBF\u95EE\u4EE4\u724C\uFF1A${i.tokenCount??0} \u6761`})):n.createEl("p",{text:"\u6682\u65E0\u91C7\u96C6\u6458\u8981"}),n.createEl("h3",{text:"\u6700\u8FD1\u65E5\u5FD7"});let a=n.createEl("ul"),l=[...r.syncLog??[]].slice(-10).reverse();if(l.length===0){a.createEl("li",{text:"\u6682\u65E0\u65E5\u5FD7"});return}for(let u of l)a.createEl("li",{text:`${new Date(u.time).toLocaleTimeString()} ${Et(u.message)}`})}onClose(){this.contentEl.empty()}};var It=["bookmark","post","like","album"];function se(e){return It.includes(e)}function Ct(e){return se(e)?e:"bookmark"}function Tt(e,t){let n=Array.isArray(e)?e.filter(se):t.filter(se);return n.length?n:["bookmark"]}var q=class extends _.Plugin{settings=M();syncEngine=null;syncIntervalId=null;statusBarEl=null;isSyncing=!1;isUnloaded=!1;async onload(){this.isUnloaded=!1,await this.loadSettings(),this.syncEngine=new H(this),this.addSettingTab(new J(this.app,this)),this.statusBarEl=this.addStatusBarItem();let t=Date.now();await this.updateSyncStatus(this.settings.a1Cookie?E(t):{...E(t),phase:"not_logged_in",message:"\u672A\u767B\u5F55"},{recordLog:!1}),this.addCommand({id:"xhs-vault-sync-login",name:"Log in to Xiaohongshu",callback:()=>this.openLoginModal()}),this.addCommand({id:"xhs-vault-sync-now",name:"Sync bookmarks now",callback:()=>{this.syncNow()}}),this.addCommand({id:"xhs-vault-sync-status",name:"Show sync status",callback:()=>this.openStatusModal()}),this.startSyncInterval(),this.openOnboardingModalAfterDelay()}async loadSettings(){let t=M(),n=await this.loadData();this.settings=Object.assign(t,n,{cookies:"",activeSyncTarget:Ct(n?.activeSyncTarget),syncCursors:{...n?.syncCursors??{}},syncedIds:{...n?.syncedIds??{}},syncTargets:Tt(n?.syncTargets,t.syncTargets),downloadVideos:n?.downloadVideos??t.downloadVideos,allSynced:{...n?.allSynced??{}},albumWhitelist:{...n?.albumWhitelist??{}},lastAlbumSnapshot:[...n?.lastAlbumSnapshot??[]],bookmarkCateNextCursor:{...n?.bookmarkCateNextCursor??{}},cateSyncAllBookmark:{...n?.cateSyncAllBookmark??{}},perAccountState:{...n?.perAccountState??{}},syncStatusSnapshot:{...t.syncStatusSnapshot,...n?.syncStatusSnapshot??{},message:m(n?.syncStatusSnapshot?.message??t.syncStatusSnapshot.message),lastError:n?.syncStatusSnapshot?.lastError===void 0?void 0:m(n.syncStatusSnapshot.lastError)},syncLog:[...n?.syncLog??[]].map(r=>({...r,message:m(r.message)})),lastSyncError:m(n?.lastSyncError??t.lastSyncError),hasSeenOnboarding:n?.hasSeenOnboarding??t.hasSeenOnboarding})}async saveSettings(){await this.saveData(this.settings)}openLoginModal(){new F(this).open()}openStatusModal(){new z(this).open()}openOnboardingModalAfterDelay(){this.settings.hasSeenOnboarding||typeof window>"u"||window.setTimeout(()=>{this.isUnloaded||this.settings.hasSeenOnboarding||new W(this).open()},500)}async updateSyncStatus(t,n={}){if(this.isUnloaded)return;let r=Date.now(),o=this.settings.syncStatusSnapshot??E(r),s=m(t.message),i=t.lastError===void 0?void 0:m(t.lastError),a={...o,...t,message:s,updatedAt:r};i!==void 0&&(a.lastError=i),this.settings.syncStatusSnapshot=a,n.recordLog!==!1&&(this.settings.syncLog=le(this.settings.syncLog??[],{time:r,phase:a.phase,message:a.message})),this.statusBarEl?.setText(O(a)),await this.saveSettings()}async syncNow(){if(!this.isUnloaded){if(!this.settings.a1Cookie){new _.Notice("\u8BF7\u5148\u767B\u5F55\u5C0F\u7EA2\u4E66\uFF0C\u518D\u6267\u884C\u540C\u6B65\u3002");return}if(!this.isSyncing){this.isSyncing=!0;try{await this.syncEngine?.syncBookmarks()}finally{this.isSyncing=!1}}}}async refreshAlbums(){if(!this.settings.a1Cookie){new _.Notice("\u8BF7\u5148\u767B\u5F55\u5C0F\u7EA2\u4E66\uFF0C\u518D\u5237\u65B0\u4E13\u8F91\u5217\u8868\u3002");return}let t=new B;try{await this.updateSyncStatus({phase:"collecting",message:"\u6B63\u5728\u5237\u65B0\u4E13\u8F91\u5217\u8868"}),await t.initWebview();let n=`a1=${this.settings.a1Cookie}`,r=await N(n);this.settings.cookies="";let o=new C(t,r),s=await o.getCurrentUser();R(this.settings,s),this.settings.lastAlbumSnapshot=await o.getUserBoards(s.userId),await this.saveSettings(),await this.updateSyncStatus({phase:"idle",message:`\u5DF2\u5237\u65B0 ${this.settings.lastAlbumSnapshot.length} \u4E2A\u4E13\u8F91`}),new _.Notice(`\u5DF2\u5237\u65B0 ${this.settings.lastAlbumSnapshot.length} \u4E2A\u4E13\u8F91\u3002`)}catch(n){let r=n instanceof Error?n.message:String(n),o=m(r);throw this.settings.lastSyncError=o,await this.updateSyncStatus({phase:"failed",message:o,lastError:o}),new _.Notice(`\u5237\u65B0\u4E13\u8F91\u5217\u8868\u5931\u8D25\uFF1A${o}`),n}finally{t.destroy()}}startSyncInterval(){if(this.stopSyncInterval(),!this.settings.autoSyncEnabled)return;let t=Math.max(5,this.settings.syncIntervalMinutes);this.syncIntervalId=this.registerInterval(window.setInterval(()=>{this.syncNow()},t*60*1e3))}stopSyncInterval(){this.syncIntervalId!==null&&(window.clearInterval(this.syncIntervalId),this.syncIntervalId=null)}onunload(){this.isUnloaded=!0,this.stopSyncInterval()}};
