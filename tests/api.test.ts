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
});
