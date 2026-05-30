import { describe, expect, it } from "vitest";
import { joinVaultPath, safeFileName } from "../src/utils/paths";

describe("safeFileName", () => {
  it("removes characters Obsidian cannot use in file paths", () => {
    expect(safeFileName("a/b:c*?x")).toBe("a b c x");
  });

  it("uses fallback when input is empty after cleanup", () => {
    expect(safeFileName("////", "Untitled")).toBe("Untitled");
  });

  it("uses fallback for dot-only path segments", () => {
    expect(safeFileName(".")).toBe("Untitled");
    expect(safeFileName("..", "Fallback")).toBe("Fallback");
  });
});

describe("joinVaultPath", () => {
  it("joins path parts without duplicate slashes", () => {
    expect(joinVaultPath("/RedNote/", "/Media/", "abc")).toBe("RedNote/Media/abc");
  });

  it("drops dot segments from path parts", () => {
    expect(joinVaultPath("RedNote", "..", "Media")).toBe("RedNote/Media");
    expect(joinVaultPath("RedNote/./Media", "note1")).toBe("RedNote/Media/note1");
  });
});
