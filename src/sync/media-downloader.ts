import { requestUrl } from "obsidian";
import type { XhsMedia } from "./types";

export interface MediaDownloadResult {
  data?: ArrayBuffer;
  ext: string;
  error?: string;
}

function mediaExt(media: XhsMedia): string {
  if (media.ext) return media.ext;
  return media.type === "video" ? "mp4" : "jpg";
}

function mediaUrl(url: string): string {
  if (url.startsWith("http://")) return `https://${url.slice("http://".length)}`;
  return url;
}

export async function downloadMedia(media: XhsMedia): Promise<MediaDownloadResult> {
  const ext = mediaExt(media);

  try {
    const response = await requestUrl({
      url: mediaUrl(media.url),
      method: "GET",
      throw: false,
      ...(media.type === "video" ? { headers: { Range: "bytes=0-" } } : {})
    });

    if (response.status < 200 || response.status >= 300) {
      return { ext, error: `HTTP ${response.status}` };
    }

    return { ext, data: response.arrayBuffer };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ext, error: message };
  }
}
