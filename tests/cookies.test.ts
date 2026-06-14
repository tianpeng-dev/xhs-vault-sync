import { describe, expect, it } from "vitest";
import { buildCookieHeader, XHS_PARTITION } from "../src/xhs/cookies";

describe("XHS cookie helpers", () => {
  it("uses a persistent Electron partition so login survives Obsidian restarts", () => {
    expect(XHS_PARTITION).toBe("persist:xhs-vault-sync");
  });

  it("merges visible and HttpOnly cookies into one request header", () => {
    const header = buildCookieHeader("a1=visible-a1; webId=visible-web", [
      { name: "web_session", value: "session-token" },
      { name: "id_token", value: "id-token" },
      { name: "a1", value: "session-a1" }
    ]);

    expect(header).toBe("a1=session-a1; webId=visible-web; web_session=session-token; id_token=id-token");
  });
});
