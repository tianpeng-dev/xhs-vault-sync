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

  it("escapes brackets in local image wikilinks", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "Test Note",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "hello",
      media: [{ type: "image", url: "https://example.com/a.jpg", localPath: "RedNote/Media/note1/a]]b[1].jpg" }]
    });

    expect(markdown).toContain("![[RedNote/Media/note1/a b 1 .jpg]]");
    expect(markdown).not.toContain("a]]b[1].jpg");
  });

  it("escapes quote characters in local video HTML attributes", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "Test Note",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "hello",
      media: [{ type: "video", url: "https://example.com/a.mp4", localPath: "RedNote/Media/note1/a\"b&c<d>.mp4" }]
    });

    expect(markdown).toContain('<video controls src="RedNote/Media/note1/a&quot;b&amp;c&lt;d&gt;.mp4"></video>');
    expect(markdown).not.toContain('src="RedNote/Media/note1/a"b');
  });

  it("renders unavailable text for unsafe remote media URLs", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "Test Note",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "hello",
      media: [{ type: "image", url: "javascript:alert(1)" }]
    });

    expect(markdown).toContain("[image link unavailable]");
    expect(markdown).not.toContain("javascript:alert");
  });

  it("encodes closing parentheses in remote media URLs", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "Test Note",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "hello",
      media: [{ type: "image", url: "https://example.com/a)b.jpg" }]
    });

    expect(markdown).toContain("[image link](https://example.com/a%29b.jpg)");
  });
});
