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
