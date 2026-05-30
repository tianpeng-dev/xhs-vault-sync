export class Notice {
  constructor(readonly message: string) {}
}

export class TFile {}

export class TFolder {}

export function normalizePath(path: string): string {
  return path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

export async function requestUrl(): Promise<never> {
  throw new Error("requestUrl mock was not configured for this test");
}
