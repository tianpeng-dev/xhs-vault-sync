import { describe, expect, it } from "vitest";
import { SignManager } from "../src/xhs/sign-manager";

describe("SignManager", () => {
  it("builds direct request signatures with the XYW prefix", () => {
    const script = new SignManager().buildInjectScript("/api/sns/web/v2/user/me", null);

    expect(script).toContain('var xS = "XYW_"');
    expect(script).not.toContain('"x-s": "XYS_"');
  });

  it("builds a bookmark collector script for the real profile page", () => {
    const script = new SignManager().buildBookmarkCollectorScript(5);

    expect(script).toContain("/api/sns/web/v2/note/collect/page");
    expect(script).toContain("__INITIAL_STATE__");
    expect(script).toContain("XMLHttpRequest.prototype.open");
    expect(script).toContain("收藏");
  });

  it("builds note detail collector script with video fallback extraction", () => {
    const script = new SignManager().buildNoteDetailCollectorScript({
      noteId: "note-video",
      xsecToken: "token"
    });

    expect(script).toContain("video[src]");
    expect(script).toContain("source[src]");
    expect(script).toContain("videoInfo");
    expect(script).toContain("video_info");
    expect(script).toContain("mp4");
  });
});
