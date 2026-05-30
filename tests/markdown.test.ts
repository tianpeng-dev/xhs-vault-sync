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
