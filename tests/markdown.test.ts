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

  it("renders sync index and synced time in frontmatter", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "Test Note",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "hello",
      media: [],
      syncIndex: 12,
      syncedAt: "2026-06-14T00:00:00.000Z"
    });

    expect(markdown).toContain("syncIndex: 12");
    expect(markdown).toContain('syncedAt: "2026-06-14T00:00:00.000Z"');
  });

  it("renders sync target and album metadata in frontmatter", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "专辑笔记",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "hello",
      media: [],
      syncTarget: "album",
      albumId: "album-a",
      albumTitle: "旅行"
    });

    expect(markdown).toContain('syncTarget: "album"');
    expect(markdown).toContain('albumId: "album-a"');
    expect(markdown).toContain('albumTitle: "旅行"');
  });

  it("renders AI category in frontmatter", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "分类笔记",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "hello",
      media: [],
      category: "AI 工具"
    });

    expect(markdown).toContain('category: "AI 工具"');
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

  it("renders local videos as HTML video tags and remote videos as links", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "Test Note",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "hello",
      media: [
        { type: "video", url: "https://example.com/a.mp4", localPath: "RedNote/Media/note1/video-1.mp4" },
        { type: "video", url: "https://example.com/b.mp4" }
      ]
    });

    expect(markdown).toContain('<video controls src="RedNote/Media/note1/video-1.mp4"></video>');
    expect(markdown).toContain("[video link](https://example.com/b.mp4)");
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

  it("normalizes remote media URLs before rendering markdown links", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "Test Note",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "hello",
      media: [{ type: "image", url: "https://example.com/a.jpg\n![pwn][x]\n[x]: https://evil.example" }]
    });

    expect(markdown).toContain("[image link](https://example.com/a.jpg![pwn][x][x]:%20https://evil.example)");
    expect(markdown).not.toContain("\n![pwn][x]");
    expect(markdown).not.toContain("\n[x]: https://evil.example");
  });

  it("renders only WenYiWen answers after note media", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "图文笔记",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "正文内容",
      media: [{ type: "image", url: "https://example.com/a.jpg", localPath: "RedNote/Media/note1/image-1.jpg" }],
      comments: [
        { author: "Bob", content: "@问一问 总结一下" },
        { author: "问一问", content: "这是问一问回答" },
        { author: "", content: "无名评论" },
        { author: "问一问", content: "第二个问一问回答" }
      ]
    });

    expect(markdown).toContain("![[RedNote/Media/note1/image-1.jpg]]");
    expect(markdown).toContain("## 问一问回答");
    expect(markdown).toContain("### 回答 1");
    expect(markdown).toContain("这是问一问回答");
    expect(markdown).toContain("### 回答 2");
    expect(markdown).toContain("第二个问一问回答");
    expect(markdown).not.toContain("### Bob");
    expect(markdown).not.toContain("@问一问 总结一下");
    expect(markdown).not.toContain("无名评论");
    expect(markdown).not.toContain("### 问一问");
  });

  it("omits comment section when there are no WenYiWen answers", () => {
    const markdown = renderNoteMarkdown({
      id: "note1",
      title: "图文笔记",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note1",
      tags: [],
      content: "正文内容",
      media: [],
      comments: [
        { author: "Bob", content: "@问一问 总结一下" },
        { author: "Alice", content: "普通评论" }
      ]
    });

    expect(markdown).not.toContain("## 评论");
    expect(markdown).not.toContain("## 问一问回答");
    expect(markdown).not.toContain("@问一问 总结一下");
    expect(markdown).not.toContain("普通评论");
  });
});
