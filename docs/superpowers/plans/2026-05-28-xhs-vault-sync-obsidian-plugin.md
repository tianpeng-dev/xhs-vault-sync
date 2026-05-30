# XHS Vault Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an open-source Obsidian desktop plugin that syncs a user's Xiaohongshu/RedNote content into an Obsidian vault without license-code gating.

**Architecture:** The plugin uses Obsidian's Electron runtime to host a login webview and a hidden signing webview. A small adapter layer signs and calls Xiaohongshu web APIs, while the sync engine handles pagination, dedupe, media download, and Markdown writing. The first shippable version targets account login, bookmark sync, note detail fetch, local image storage, and incremental state.

**Tech Stack:** Obsidian Plugin API, TypeScript, esbuild, Jest or Vitest, Electron webview, Node fetch/requestUrl, local plugin settings JSON.

---

## Scope

### MVP Included

- Obsidian plugin scaffold with settings tab.
- Manual Xiaohongshu login through Electron webview.
- Hidden webview signing using the Xiaohongshu page context.
- Bookmark list sync.
- Note detail fetch through `/api/sns/web/v1/feed`.
- Markdown files with YAML frontmatter.
- Image download into `RedNote/Media/{noteId}/`.
- Incremental sync state using cursors and synced note IDs.
- Rate-limit and login-expiry handling that stops auto sync.

### Deferred

- Likes sync.
- Personal posts sync.
- Album/category sync.
- Video download.
- AI classification.
- Multi-account state restore.
- RedNote international host support.

## File Structure

- Create: `package.json` - npm scripts and dev dependencies.
- Create: `manifest.json` - Obsidian plugin metadata.
- Create: `versions.json` - Obsidian compatibility metadata.
- Create: `esbuild.config.mjs` - build script.
- Create: `tsconfig.json` - TypeScript config.
- Create: `src/main.ts` - plugin entrypoint and command registration.
- Create: `src/settings.ts` - settings schema, defaults, load/save helpers.
- Create: `src/ui/settings-tab.ts` - settings tab UI.
- Create: `src/ui/login-modal.ts` - login webview modal and cookie extraction.
- Create: `src/xhs/hosts.ts` - host constants and URL helpers.
- Create: `src/xhs/sign-manager.ts` - hidden webview setup, signing, signed requests.
- Create: `src/xhs/api.ts` - Xiaohongshu API adapter.
- Create: `src/sync/sync-engine.ts` - sync orchestration.
- Create: `src/sync/types.ts` - domain types.
- Create: `src/vault/vault-writer.ts` - folder, Markdown, and media writing.
- Create: `src/vault/markdown.ts` - Markdown rendering.
- Create: `src/utils/paths.ts` - safe filenames and path helpers.
- Create: `styles.css` - webview modal styling.
- Create: `tests/markdown.test.ts` - frontmatter and content rendering tests.
- Create: `tests/paths.test.ts` - filename/path sanitization tests.
- Create: `tests/sync-state.test.ts` - sync cursor and dedupe state tests.

---

## Task 1: Plugin Scaffold

**Files:**
- Create: `package.json`
- Create: `manifest.json`
- Create: `versions.json`
- Create: `esbuild.config.mjs`
- Create: `tsconfig.json`
- Create: `src/main.ts`
- Create: `styles.css`

- [ ] **Step 1: Create package metadata**

Create `package.json`:

```json
{
  "name": "xhs-vault-sync",
  "version": "0.1.0",
  "description": "Open-source Xiaohongshu/RedNote sync for Obsidian.",
  "main": "main.js",
  "scripts": {
    "build": "node esbuild.config.mjs production",
    "dev": "node esbuild.config.mjs",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "keywords": ["obsidian", "xiaohongshu", "rednote", "markdown"],
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^22.10.0",
    "builtin-modules": "^4.0.0",
    "esbuild": "^0.24.0",
    "obsidian": "^1.7.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create Obsidian metadata**

Create `manifest.json`:

```json
{
  "id": "xhs-vault-sync",
  "name": "XHS Vault Sync",
  "version": "0.1.0",
  "minAppVersion": "1.5.0",
  "description": "Sync Xiaohongshu/RedNote bookmarks into your Obsidian vault.",
  "author": "Open Source Contributors",
  "isDesktopOnly": true
}
```

Create `versions.json`:

```json
{
  "0.1.0": "1.5.0"
}
```

- [ ] **Step 3: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES2022",
    "allowJs": true,
    "noImplicitAny": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "strictNullChecks": true,
    "lib": ["DOM", "ES2022"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"]
}
```

- [ ] **Step 4: Create esbuild config**

Create `esbuild.config.mjs`:

```js
import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const prod = process.argv[2] === "production";

await esbuild.build({
  banner: { js: "/* XHS Vault Sync */" },
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron", ...builtins],
  format: "cjs",
  target: "es2022",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  minify: prod
});
```

- [ ] **Step 5: Create plugin entrypoint**

Create `src/main.ts`:

```ts
import { Notice, Plugin } from "obsidian";

export default class XhsVaultSyncPlugin extends Plugin {
  async onload(): Promise<void> {
    this.addCommand({
      id: "xhs-vault-sync-now",
      name: "Sync bookmarks now",
      callback: () => new Notice("XHS Vault Sync is installed.")
    });
  }

  onunload(): void {
    // Obsidian unregisters commands automatically.
  }
}
```

- [ ] **Step 6: Create modal styles**

Create `styles.css`:

```css
.xhs-login-modal {
  width: 800px;
  height: 620px;
}

.xhs-login-modal .modal-content {
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.xhs-webview-container {
  flex: 1;
}

.xhs-webview-container webview {
  width: 100%;
  height: 100%;
  border: 0;
}
```

- [ ] **Step 7: Install dependencies and build**

Run:

```bash
npm install
npm run typecheck
npm run build
```

Expected: `main.js` is generated and TypeScript reports no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json manifest.json versions.json esbuild.config.mjs tsconfig.json src/main.ts styles.css
git commit -m "chore: scaffold xhs vault sync plugin"
```

---

## Task 2: Settings Model and Settings Tab

**Files:**
- Create: `src/settings.ts`
- Create: `src/ui/settings-tab.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Define settings**

Create `src/settings.ts`:

```ts
export type SyncTarget = "bookmark";

export interface XhsVaultSyncSettings {
  rootFolder: string;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  syncBatchSize: number;
  activeSyncTarget: SyncTarget;
  downloadImages: boolean;
  cookies: string;
  a1Cookie: string;
  userId: string;
  userName: string;
  syncCursors: Record<string, string>;
  syncedIds: Record<string, true>;
  lastSyncAt: number;
}

export const DEFAULT_SETTINGS: XhsVaultSyncSettings = {
  rootFolder: "RedNote",
  autoSyncEnabled: false,
  syncIntervalMinutes: 10,
  syncBatchSize: 5,
  activeSyncTarget: "bookmark",
  downloadImages: true,
  cookies: "",
  a1Cookie: "",
  userId: "",
  userName: "",
  syncCursors: {},
  syncedIds: {},
  lastSyncAt: 0
};
```

- [ ] **Step 2: Create settings tab**

Create `src/ui/settings-tab.ts`:

```ts
import { App, PluginSettingTab, Setting } from "obsidian";
import type XhsVaultSyncPlugin from "../main";

export class XhsVaultSyncSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: XhsVaultSyncPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "XHS Vault Sync" });

    new Setting(containerEl)
      .setName("Root folder")
      .setDesc("Synced Markdown and media will be stored under this vault folder.")
      .addText((text) =>
        text
          .setPlaceholder("RedNote")
          .setValue(this.plugin.settings.rootFolder)
          .onChange(async (value) => {
            this.plugin.settings.rootFolder = value.trim() || "RedNote";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Batch size")
      .setDesc("Number of notes to sync per run. Keep this between 1 and 10 to reduce rate-limit risk.")
      .addText((text) =>
        text
          .setPlaceholder("5")
          .setValue(String(this.plugin.settings.syncBatchSize))
          .onChange(async (value) => {
            const parsed = Number(value);
            this.plugin.settings.syncBatchSize = Number.isFinite(parsed)
              ? Math.min(10, Math.max(1, Math.floor(parsed)))
              : 5;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Download images")
      .setDesc("Save note images into the vault instead of linking remote URLs.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.downloadImages)
          .onChange(async (value) => {
            this.plugin.settings.downloadImages = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
```

- [ ] **Step 3: Wire settings into plugin**

Replace `src/main.ts` with:

```ts
import { Notice, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, type XhsVaultSyncSettings } from "./settings";
import { XhsVaultSyncSettingTab } from "./ui/settings-tab";

export default class XhsVaultSyncPlugin extends Plugin {
  settings: XhsVaultSyncSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new XhsVaultSyncSettingTab(this.app, this));

    this.addCommand({
      id: "xhs-vault-sync-now",
      name: "Sync bookmarks now",
      callback: () => new Notice("XHS Vault Sync is installed.")
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  onunload(): void {
    // Obsidian unregisters commands automatically.
  }
}
```

- [ ] **Step 4: Typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/settings.ts src/ui/settings-tab.ts src/main.ts
git commit -m "feat: add plugin settings"
```

---

## Task 3: Path and Markdown Rendering

**Files:**
- Create: `src/utils/paths.ts`
- Create: `src/sync/types.ts`
- Create: `src/vault/markdown.ts`
- Create: `tests/paths.test.ts`
- Create: `tests/markdown.test.ts`

- [ ] **Step 1: Add path utilities**

Create `src/utils/paths.ts`:

```ts
const INVALID_FILENAME_CHARS = /[\\\\/:*?"<>|#^[\]]/g;

export function safeFileName(input: string, fallback = "Untitled"): string {
  const cleaned = input
    .replace(INVALID_FILENAME_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || fallback).slice(0, 120);
}

export function joinVaultPath(...parts: string[]): string {
  return parts
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}
```

- [ ] **Step 2: Add sync types**

Create `src/sync/types.ts`:

```ts
export interface XhsMedia {
  url: string;
  type: "image" | "video";
  ext?: string;
  localPath?: string;
}

export interface XhsNote {
  id: string;
  title: string;
  author: string;
  url: string;
  tags: string[];
  content: string;
  createdAt?: string;
  updatedAt?: string;
  media: XhsMedia[];
}

export interface BookmarkPage {
  notes: Array<{
    noteId: string;
    xsecToken: string;
  }>;
  cursor: string;
  hasMore: boolean;
}
```

- [ ] **Step 3: Add Markdown renderer**

Create `src/vault/markdown.ts`:

```ts
import type { XhsNote } from "../sync/types";

function yamlString(value: string): string {
  return JSON.stringify(value);
}

export function renderNoteMarkdown(note: XhsNote): string {
  const tags = note.tags.map((tag) => `  - ${yamlString(tag)}`).join("\n");
  const media = note.media
    .map((item) => {
      if (item.localPath && item.type === "image") return `![[${item.localPath}]]`;
      if (item.localPath && item.type === "video") return `<video controls src="${item.localPath}"></video>`;
      return `[${item.type} link](${item.url})`;
    })
    .join("\n\n");

  return [
    "---",
    `source: ${yamlString("xiaohongshu")}`,
    `resourceId: ${yamlString(note.id)}`,
    `title: ${yamlString(note.title)}`,
    `author: ${yamlString(note.author)}`,
    `url: ${yamlString(note.url)}`,
    note.createdAt ? `createdAt: ${yamlString(note.createdAt)}` : undefined,
    note.updatedAt ? `updatedAt: ${yamlString(note.updatedAt)}` : undefined,
    "tags:",
    tags || "  - \"xhs\"",
    "---",
    "",
    `# ${note.title || "Untitled"}`,
    "",
    note.content || "(No content)",
    "",
    media
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .trimEnd()
    .concat("\n");
}
```

- [ ] **Step 4: Add tests**

Create `tests/paths.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { joinVaultPath, safeFileName } from "../src/utils/paths";

describe("safeFileName", () => {
  it("removes characters Obsidian cannot use in file paths", () => {
    expect(safeFileName("a/b:c*?x")).toBe("a b c x");
  });

  it("uses fallback when input is empty after cleanup", () => {
    expect(safeFileName("////", "Untitled")).toBe("Untitled");
  });
});

describe("joinVaultPath", () => {
  it("joins path parts without duplicate slashes", () => {
    expect(joinVaultPath("/RedNote/", "/Media/", "abc")).toBe("RedNote/Media/abc");
  });
});
```

Create `tests/markdown.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { renderNoteMarkdown } from "../src/vault/markdown";

describe("renderNoteMarkdown", () => {
  it("renders frontmatter, body, and local image embeds", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "Test Note",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: ["food"],
      content: "hello",
      media: [{ type: "image", url: "https://example.com/a.jpg", localPath: "RedNote/Media/note1/image-1.jpg" }]
    });

    expect(markdown).toContain('resourceId: "note1"');
    expect(markdown).toContain("# Test Note");
    expect(markdown).toContain("![[RedNote/Media/note1/image-1.jpg]]");
  });
});
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test -- tests/paths.test.ts tests/markdown.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/utils/paths.ts src/sync/types.ts src/vault/markdown.ts tests/paths.test.ts tests/markdown.test.ts
git commit -m "feat: render xhs notes as markdown"
```

---

## Task 4: Vault Writer

**Files:**
- Create: `src/vault/vault-writer.ts`

- [ ] **Step 1: Implement vault writer**

Create `src/vault/vault-writer.ts`:

```ts
import type { App, TFolder } from "obsidian";
import { normalizePath } from "obsidian";
import type { XhsNote } from "../sync/types";
import { joinVaultPath, safeFileName } from "../utils/paths";
import { renderNoteMarkdown } from "./markdown";

export class VaultWriter {
  constructor(private readonly app: App, private readonly rootFolder: string) {}

  async ensureFolder(path: string): Promise<void> {
    const normalized = normalizePath(path);
    if (this.app.vault.getAbstractFileByPath(normalized)) return;

    const parent = normalized.split("/").slice(0, -1).join("/");
    if (parent) await this.ensureFolder(parent);
    await this.app.vault.createFolder(normalized);
  }

  async writeNote(note: XhsNote): Promise<string> {
    await this.ensureFolder(this.rootFolder);
    const fileName = `${safeFileName(note.title || note.id)}.md`;
    const path = normalizePath(joinVaultPath(this.rootFolder, fileName));
    const content = renderNoteMarkdown(note);
    const existing = this.app.vault.getAbstractFileByPath(path);

    if (existing) {
      await this.app.vault.modify(existing as never, content);
    } else {
      await this.app.vault.create(path, content);
    }

    return path;
  }

  async writeMedia(noteId: string, index: number, data: ArrayBuffer, ext: string): Promise<string> {
    const folder = normalizePath(joinVaultPath(this.rootFolder, "Media", safeFileName(noteId)));
    await this.ensureFolder(folder);
    const path = normalizePath(joinVaultPath(folder, `image-${index}.${ext || "jpg"}`));
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing) await this.app.vault.delete(existing);
    await this.app.vault.createBinary(path, data);
    return path;
  }
}
```

- [ ] **Step 2: Typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors. If Obsidian type narrowing complains about `modify`, replace `existing as never` with an imported `TFile` cast.

- [ ] **Step 3: Commit**

```bash
git add src/vault/vault-writer.ts
git commit -m "feat: write synced notes to vault"
```

---

## Task 5: Login Modal

**Files:**
- Create: `src/xhs/hosts.ts`
- Create: `src/ui/login-modal.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Add host constants**

Create `src/xhs/hosts.ts`:

```ts
export const XHS_HOST = {
  web: "https://www.xiaohongshu.com",
  explore: "https://www.xiaohongshu.com/explore",
  api: "https://edith.xiaohongshu.com"
} as const;
```

- [ ] **Step 2: Add login modal**

Create `src/ui/login-modal.ts`:

```ts
import { Modal, Notice } from "obsidian";
import type XhsVaultSyncPlugin from "../main";
import { XHS_HOST } from "../xhs/hosts";

type WebviewElement = HTMLElement & {
  getURL?: () => string;
  executeJavaScript?: (code: string) => Promise<string>;
};

export class LoginModal extends Modal {
  private webviewEl: WebviewElement | null = null;

  constructor(private readonly plugin: XhsVaultSyncPlugin) {
    super(plugin.app);
  }

  onOpen(): void {
    this.modalEl.addClass("xhs-login-modal");
    this.contentEl.empty();

    const container = this.contentEl.createDiv({ cls: "xhs-webview-container" });
    const webview = document.createElement("webview") as WebviewElement;
    webview.setAttribute("src", XHS_HOST.web);
    webview.setAttribute("partition", "persist:xhs-vault-sync");
    webview.setAttribute("allowpopups", "true");
    container.appendChild(webview);
    this.webviewEl = webview;

    const actions = this.contentEl.createDiv();
    actions.createEl("button", { text: "I am logged in" }).addEventListener("click", () => {
      void this.handleLoginComplete();
    });
  }

  async handleLoginComplete(): Promise<void> {
    if (!this.webviewEl?.executeJavaScript) {
      new Notice("Login webview is not ready.");
      return;
    }

    const cookies = await this.webviewEl.executeJavaScript("document.cookie");
    const a1Cookie = cookies.match(/(?:^|;\\s*)a1=([^;]+)/)?.[1] ?? "";
    if (!a1Cookie) {
      new Notice("No a1 cookie found. Finish login first.");
      return;
    }

    this.plugin.settings.cookies = cookies;
    this.plugin.settings.a1Cookie = a1Cookie;
    await this.plugin.saveSettings();
    new Notice("Xiaohongshu login saved.");
    this.close();
  }

  onClose(): void {
    this.contentEl.empty();
    this.webviewEl = null;
  }
}
```

- [ ] **Step 3: Add login command**

Modify `src/main.ts` command registration:

```ts
import { LoginModal } from "./ui/login-modal";
```

Add inside `onload()`:

```ts
this.addCommand({
  id: "xhs-vault-sync-login",
  name: "Log in to Xiaohongshu",
  callback: () => new LoginModal(this).open()
});
```

- [ ] **Step 4: Build**

Run:

```bash
npm run typecheck
npm run build
```

Expected: no TypeScript or build errors.

- [ ] **Step 5: Commit**

```bash
git add src/xhs/hosts.ts src/ui/login-modal.ts src/main.ts
git commit -m "feat: add xhs login modal"
```

---

## Task 6: Sign Manager

**Files:**
- Create: `src/xhs/sign-manager.ts`

- [ ] **Step 1: Implement sign manager**

Create `src/xhs/sign-manager.ts`:

```ts
import { XHS_HOST } from "./hosts";

type WebviewElement = HTMLElement & {
  executeJavaScript?: (code: string) => Promise<unknown>;
};

export interface XhsSignedHeaders {
  "x-s": string;
  "x-t": string;
  "x-s-common": string;
  "x-b3-traceid": string;
}

export class SignManager {
  private webviewEl: WebviewElement | null = null;
  private ready = false;

  async initWebview(): Promise<void> {
    if (this.ready && this.webviewEl) return;

    const webview = document.createElement("webview") as WebviewElement;
    webview.setAttribute("src", XHS_HOST.explore);
    webview.setAttribute("partition", "persist:xhs-vault-sync");
    webview.setAttribute("allowpopups", "false");
    webview.setAttribute("style", "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;");
    document.body.appendChild(webview);
    this.webviewEl = webview;

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
  }

  destroy(): void {
    this.webviewEl?.parentElement?.removeChild(this.webviewEl);
    this.webviewEl = null;
    this.ready = false;
  }

  async sign(apiPath: string, body?: unknown): Promise<XhsSignedHeaders> {
    if (!this.webviewEl?.executeJavaScript) throw new Error("Sign webview is not ready");
    const script = this.buildInjectScript(apiPath, body ?? null);
    const result = await this.webviewEl.executeJavaScript(script) as Partial<XhsSignedHeaders> & { error?: string };
    if (result.error) throw new Error(`Sign inject failed: ${result.error}`);
    if (!result["x-s"] || !result["x-t"] || !result["x-s-common"] || !result["x-b3-traceid"]) {
      throw new Error("Sign inject returned incomplete headers");
    }
    return result as XhsSignedHeaders;
  }

  buildInjectScript(apiPath: string, body: unknown): string {
    return `
      (function() {
        try {
          var apiUrl = ${JSON.stringify(apiPath)};
          var apiData = ${JSON.stringify(body)};
          var timestamp = Date.now();
          if (typeof window.mnsv2 !== "function") {
            return { error: "window.mnsv2 not available" };
          }
          var payload = apiUrl;
          if (apiData !== null && apiData !== undefined) {
            payload += typeof apiData === "string" ? apiData : JSON.stringify(apiData);
          }
          var x3 = window.mnsv2(payload, "", "");
          var traceId = "";
          var chars = "abcdef0123456789";
          for (var i = 0; i < 16; i++) traceId += chars.charAt(Math.floor(Math.random() * chars.length));
          return {
            "x-s": "XYS_" + btoa(JSON.stringify({ x0: "4.3.3", x1: "xhs-pc-web", x3: x3 })),
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
}
```

- [ ] **Step 2: Build**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 3: Manual verification in Obsidian**

Install the plugin into a test vault, open Developer Tools, and run a command that calls:

```ts
const manager = new SignManager();
await manager.initWebview();
console.log(await manager.sign("/api/sns/web/v2/user/me"));
manager.destroy();
```

Expected: object contains `x-s`, `x-t`, `x-s-common`, and `x-b3-traceid`. If `window.mnsv2 not available`, inspect the loaded page and update `buildInjectScript` to call the current Xiaohongshu signing function.

- [ ] **Step 4: Commit**

```bash
git add src/xhs/sign-manager.ts
git commit -m "feat: add hidden webview signer"
```

---

## Task 7: API Adapter

**Files:**
- Create: `src/xhs/api.ts`

- [ ] **Step 1: Implement API adapter**

Create `src/xhs/api.ts`:

```ts
import { requestUrl } from "obsidian";
import type { BookmarkPage, XhsMedia, XhsNote } from "../sync/types";
import { XHS_HOST } from "./hosts";
import type { SignManager } from "./sign-manager";

const USER_URL = "/api/sns/web/v2/user/me";
const BOOKMARK_URL = "/api/sns/web/v2/note/collect/page";
const FEED_URL = "/api/sns/web/v1/feed";

export class XhsApi {
  constructor(private readonly signer: SignManager) {}

  async getCurrentUser(): Promise<{ userId: string; userName: string }> {
    const data = await this.signedGet(USER_URL);
    const user = data?.data;
    if (!user?.user_id || user.guest) throw new Error("Not logged in");
    return { userId: user.user_id, userName: user.nickname ?? "" };
  }

  async getBookmarks(cursor: string, pageSize: number): Promise<BookmarkPage> {
    const query = new URLSearchParams({
      cursor,
      num: String(pageSize),
      image_formats: "jpg,webp,avif"
    });
    const data = await this.signedGet(`${BOOKMARK_URL}?${query.toString()}`);
    const notes = (data?.data?.notes ?? []).map((item: any) => ({
      noteId: item.note_id ?? item.id,
      xsecToken: item.xsec_token ?? ""
    })).filter((item: { noteId: string }) => item.noteId);

    return {
      notes,
      cursor: data?.data?.cursor ?? "",
      hasMore: Boolean(data?.data?.has_more)
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
    const data = await this.signedPost(FEED_URL, body);
    const note = data?.data?.items?.[0]?.note_card;
    if (!note) return null;

    const images: XhsMedia[] = (note.image_list ?? []).map((image: any) => ({
      type: "image",
      url: image.url_default ?? image.url ?? image.info_list?.[0]?.url ?? "",
      ext: "jpg"
    })).filter((item: XhsMedia) => item.url);

    return {
      id: note.note_id ?? noteId,
      title: note.display_title ?? note.title ?? "Untitled",
      author: note.user?.nickname ?? "",
      url: `${XHS_HOST.web}/explore/${noteId}?xsec_token=${encodeURIComponent(xsecToken)}`,
      tags: (note.tag_list ?? []).map((tag: any) => tag.name).filter(Boolean),
      content: note.desc ?? "",
      createdAt: note.time ? new Date(note.time).toISOString() : undefined,
      updatedAt: note.last_update_time ? new Date(note.last_update_time).toISOString() : undefined,
      media: images
    };
  }

  private async signedGet(pathWithQuery: string): Promise<any> {
    const headers = await this.signer.sign(pathWithQuery);
    const response = await requestUrl({
      url: `${XHS_HOST.api}${pathWithQuery}`,
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "Origin": XHS_HOST.web,
        "Referer": `${XHS_HOST.web}/`
      },
      throw: false
    });
    if (response.status >= 400) throw new Error(`XHS HTTP ${response.status}`);
    return response.json;
  }

  private async signedPost(path: string, body: unknown): Promise<any> {
    const headers = await this.signer.sign(path, body);
    const response = await requestUrl({
      url: `${XHS_HOST.api}${path}`,
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "Origin": XHS_HOST.web,
        "Referer": `${XHS_HOST.web}/`
      },
      body: JSON.stringify(body),
      throw: false
    });
    if (response.status >= 400) throw new Error(`XHS HTTP ${response.status}`);
    return response.json;
  }
}
```

- [ ] **Step 2: Typecheck**

Run:

```bash
npm run typecheck
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/xhs/api.ts
git commit -m "feat: add xhs api adapter"
```

---

## Task 8: Sync Engine

**Files:**
- Create: `src/sync/sync-engine.ts`
- Create: `tests/sync-state.test.ts`

- [ ] **Step 1: Add sync state helper test**

Create `tests/sync-state.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { shouldSyncNote, markNoteSynced } from "../src/sync/sync-engine";

describe("sync state helpers", () => {
  it("skips already synced note ids", () => {
    expect(shouldSyncNote({ note1: true }, "note1")).toBe(false);
    expect(shouldSyncNote({ note1: true }, "note2")).toBe(true);
  });

  it("marks a note id as synced", () => {
    const state: Record<string, true> = {};
    markNoteSynced(state, "note1");
    expect(state).toEqual({ note1: true });
  });
});
```

- [ ] **Step 2: Implement sync engine**

Create `src/sync/sync-engine.ts`:

```ts
import { Notice, requestUrl } from "obsidian";
import type XhsVaultSyncPlugin from "../main";
import { VaultWriter } from "../vault/vault-writer";
import { XhsApi } from "../xhs/api";
import { SignManager } from "../xhs/sign-manager";

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
      await signer.initWebview();
      const api = new XhsApi(signer);
      const writer = new VaultWriter(this.plugin.app, this.plugin.settings.rootFolder);
      const user = await api.getCurrentUser();
      this.plugin.settings.userId = user.userId;
      this.plugin.settings.userName = user.userName;

      const cursor = this.plugin.settings.syncCursors.bookmark ?? "";
      const page = await api.getBookmarks(cursor, this.plugin.settings.syncBatchSize);
      let saved = 0;

      for (const item of page.notes) {
        if (!shouldSyncNote(this.plugin.settings.syncedIds, item.noteId)) continue;
        const detail = await api.getNoteDetail(item.noteId, item.xsecToken);
        if (!detail) continue;

        if (this.plugin.settings.downloadImages) {
          for (let index = 0; index < detail.media.length; index++) {
            const media = detail.media[index];
            if (media.type !== "image") continue;
            const response = await requestUrl({ url: media.url, method: "GET", throw: false });
            if (response.status >= 200 && response.status < 300) {
              media.localPath = await writer.writeMedia(detail.id, index + 1, response.arrayBuffer, media.ext ?? "jpg");
            }
          }
        }

        await writer.writeNote(detail);
        markNoteSynced(this.plugin.settings.syncedIds, item.noteId);
        saved++;
      }

      this.plugin.settings.syncCursors.bookmark = page.cursor;
      this.plugin.settings.lastSyncAt = Date.now();
      await this.plugin.saveSettings();
      new Notice(`XHS sync complete: ${saved} notes saved.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(`XHS sync failed: ${message}`);
      throw error;
    } finally {
      signer.destroy();
      this.isSyncing = false;
    }
  }
}
```

- [ ] **Step 3: Run tests**

Run:

```bash
npm test -- tests/sync-state.test.ts
npm run typecheck
```

Expected: tests pass and no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/sync/sync-engine.ts tests/sync-state.test.ts
git commit -m "feat: sync xhs bookmarks"
```

---

## Task 9: Wire Sync Command and Auto Sync

**Files:**
- Modify: `src/main.ts`
- Modify: `src/ui/settings-tab.ts`

- [ ] **Step 1: Wire sync engine**

Modify `src/main.ts`:

```ts
import { Notice, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, type XhsVaultSyncSettings } from "./settings";
import { SyncEngine } from "./sync/sync-engine";
import { LoginModal } from "./ui/login-modal";
import { XhsVaultSyncSettingTab } from "./ui/settings-tab";

export default class XhsVaultSyncPlugin extends Plugin {
  settings: XhsVaultSyncSettings = DEFAULT_SETTINGS;
  private syncEngine: SyncEngine | null = null;
  private syncIntervalId: number | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.syncEngine = new SyncEngine(this);
    this.addSettingTab(new XhsVaultSyncSettingTab(this.app, this));

    this.addCommand({
      id: "xhs-vault-sync-login",
      name: "Log in to Xiaohongshu",
      callback: () => new LoginModal(this).open()
    });

    this.addCommand({
      id: "xhs-vault-sync-now",
      name: "Sync bookmarks now",
      callback: () => void this.syncNow()
    });

    this.startSyncInterval();
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async syncNow(): Promise<void> {
    if (!this.settings.a1Cookie) {
      new Notice("Log in to Xiaohongshu before syncing.");
      return;
    }
    await this.syncEngine?.syncBookmarks();
  }

  startSyncInterval(): void {
    this.stopSyncInterval();
    if (!this.settings.autoSyncEnabled) return;
    const minutes = Math.max(5, this.settings.syncIntervalMinutes);
    this.syncIntervalId = this.registerInterval(
      window.setInterval(() => void this.syncNow(), minutes * 60 * 1000)
    );
  }

  stopSyncInterval(): void {
    if (this.syncIntervalId !== null) {
      window.clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  onunload(): void {
    this.stopSyncInterval();
  }
}
```

- [ ] **Step 2: Add auto-sync setting**

Add to `src/ui/settings-tab.ts` inside `display()`:

```ts
new Setting(containerEl)
  .setName("Auto sync")
  .setDesc("Run bookmark sync on an interval. Minimum interval is 5 minutes.")
  .addToggle((toggle) =>
    toggle
      .setValue(this.plugin.settings.autoSyncEnabled)
      .onChange(async (value) => {
        this.plugin.settings.autoSyncEnabled = value;
        await this.plugin.saveSettings();
        this.plugin.startSyncInterval();
      })
  );

new Setting(containerEl)
  .setName("Sync interval minutes")
  .setDesc("Minimum 5 minutes.")
  .addText((text) =>
    text
      .setValue(String(this.plugin.settings.syncIntervalMinutes))
      .onChange(async (value) => {
        const parsed = Number(value);
        this.plugin.settings.syncIntervalMinutes = Number.isFinite(parsed)
          ? Math.max(5, Math.floor(parsed))
          : 10;
        await this.plugin.saveSettings();
        this.plugin.startSyncInterval();
      })
  );
```

- [ ] **Step 3: Build**

Run:

```bash
npm run typecheck
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/main.ts src/ui/settings-tab.ts
git commit -m "feat: wire bookmark sync command"
```

---

## Task 10: Manual End-to-End Verification

**Files:**
- Modify only if verification exposes defects.

- [ ] **Step 1: Install into test vault**

Run from repository root:

```bash
npm run build
mkdir -p "/path/to/test-vault/.obsidian/plugins/xhs-vault-sync"
cp main.js manifest.json styles.css "/path/to/test-vault/.obsidian/plugins/xhs-vault-sync/"
```

Expected: plugin appears in Obsidian community plugin list after reload.

- [ ] **Step 2: Log in**

In Obsidian:

1. Enable `XHS Vault Sync`.
2. Run command `Log in to Xiaohongshu`.
3. Complete login in the modal.
4. Click `I am logged in`.

Expected: notice says `Xiaohongshu login saved.`

- [ ] **Step 3: Sync bookmarks**

Run command `Sync bookmarks now`.

Expected:

- `RedNote/` folder exists.
- At least one `.md` file is created when account has bookmarks.
- `RedNote/Media/{noteId}/` exists when image download is enabled.
- Plugin settings contain updated `syncCursors.bookmark`, `syncedIds`, and `lastSyncAt`.

- [ ] **Step 4: Re-run sync**

Run command `Sync bookmarks now` again.

Expected: already synced note IDs are skipped and duplicate Markdown files are not created.

- [ ] **Step 5: Commit fixes from verification**

If no changes were needed:

```bash
git status --short
```

Expected: clean working tree.

If fixes were needed:

```bash
git add src tests
git commit -m "fix: stabilize bookmark sync verification"
```

---

## Task 11: README and Open-Source Positioning

**Files:**
- Create: `README.md`
- Create: `LICENSE`

- [ ] **Step 1: Create README**

Create `README.md`:

```markdown
# XHS Vault Sync

XHS Vault Sync is an open-source Obsidian desktop plugin for syncing Xiaohongshu/RedNote bookmarks into a local Obsidian vault.

## Features

- Manual Xiaohongshu login in an Obsidian webview
- Bookmark sync
- Incremental cursor-based sync
- Markdown notes with YAML frontmatter
- Optional local image download
- No license-code gate and no external authorization service

## Limits

This plugin uses Xiaohongshu web endpoints and the logged-in web session. These endpoints are not a public API and may change. Use conservative sync intervals and keep a local backup of important vault data.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Privacy

Login cookies stay in the local Obsidian/Electron profile and plugin settings. The plugin does not send license codes, device IDs, or analytics to a third-party service.
```

- [ ] **Step 2: Add MIT license**

Create `LICENSE` using the standard MIT license text with the project copyright holder.

- [ ] **Step 3: Commit**

```bash
git add README.md LICENSE
git commit -m "docs: describe open-source plugin"
```

---

## Self-Review

- Spec coverage: MVP login, signing, bookmark API, Markdown, image download, incremental state, settings, and manual verification are covered.
- Placeholder scan: no unresolved placeholder markers or unspecified implementation steps remain. The only intentionally deferred items are listed in scope.
- Type consistency: `XhsVaultSyncPlugin`, `XhsVaultSyncSettings`, `SyncEngine`, `SignManager`, `XhsApi`, `VaultWriter`, and `XhsNote` names are consistent across tasks.
- Risk note: the exact signing injection may require adjustment after manual verification because Xiaohongshu's page-side signing function can change. That risk is isolated to `src/xhs/sign-manager.ts`.
