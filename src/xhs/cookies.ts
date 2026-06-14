import { XHS_HOST } from "./hosts";

export interface StoredCookie {
  name: string;
  value: string;
}

interface ElectronCookieStore {
  get(filter: { domain?: string; url?: string }): Promise<StoredCookie[]>;
}

interface ElectronSession {
  cookies: ElectronCookieStore;
}

interface ElectronLike {
  session?: {
    fromPartition(partition: string): ElectronSession;
  };
  remote?: {
    session?: {
      fromPartition(partition: string): ElectronSession;
    };
  };
}

export const XHS_PARTITION = "persist:xhs-vault-sync";

function parseCookieHeader(header: string): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    cookies.set(trimmed.slice(0, separator), trimmed.slice(separator + 1));
  }
  return cookies;
}

export function buildCookieHeader(visibleCookieHeader: string, storedCookies: StoredCookie[]): string {
  const merged = parseCookieHeader(visibleCookieHeader);
  for (const cookie of storedCookies) {
    if (!cookie.name || !cookie.value) continue;
    merged.set(cookie.name, cookie.value);
  }
  return Array.from(merged.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function getElectronSession(): ElectronSession | null {
  const electron = require("electron") as ElectronLike;
  return (
    electron.session?.fromPartition(XHS_PARTITION) ??
    electron.remote?.session?.fromPartition(XHS_PARTITION) ??
    null
  );
}

export async function readXhsCookieHeader(visibleCookieHeader: string): Promise<string> {
  const partitionSession = getElectronSession();
  if (!partitionSession) return visibleCookieHeader;

  // HttpOnly 登录态不会出现在 document.cookie 中，必须从 Electron 分区读取。
  const [rootCookies, apiCookies] = await Promise.all([
    partitionSession.cookies.get({ domain: "xiaohongshu.com" }),
    partitionSession.cookies.get({ url: XHS_HOST.api })
  ]);

  return buildCookieHeader(visibleCookieHeader, [...rootCookies, ...apiCookies]);
}
