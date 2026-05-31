export class Notice {
  constructor(readonly message: string) {}
}

export class TFile {}

export class TFolder {}

export function normalizePath(path: string): string {
  return path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

type RequestUrlMock = (options: unknown) => Promise<unknown>;

let requestUrlMock: RequestUrlMock | null = null;

export function __setRequestUrlMock(mock: RequestUrlMock | null): void {
  requestUrlMock = mock;
}

export async function requestUrl(options: unknown): Promise<unknown> {
  if (!requestUrlMock) throw new Error("requestUrl mock was not configured for this test");
  return requestUrlMock(options);
}
