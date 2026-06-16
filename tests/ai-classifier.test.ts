import { afterEach, describe, expect, it, vi } from "vitest";
import { classifyNoteCategory } from "../src/sync/ai-classifier";
import { __setRequestUrlMock } from "./mocks/obsidian";

describe("classifyNoteCategory", () => {
  afterEach(() => {
    __setRequestUrlMock(null);
  });

  it("uses an OpenAI compatible chat completion request and returns a known category", async () => {
    const requests: unknown[] = [];
    __setRequestUrlMock(vi.fn(async (options) => {
      requests.push(options);
      return {
        status: 200,
        json: {
          choices: [
            {
              message: {
                content: "AI 工具"
              }
            }
          ]
        }
      };
    }));

    const category = await classifyNoteCategory(
      {
        id: "note1",
        title: "Claude Code 使用技巧",
        author: "Alice",
        url: "https://www.xiaohongshu.com/explore/note1",
        tags: ["AI"],
        content: "如何搭建 AI 代理工作流",
        media: []
      },
      {
        apiKey: "sk-secret",
        baseUrl: "https://api.example.com/v1",
        model: "test-model",
        categories: ["AI 工具", "生活"]
      }
    );

    expect(category).toBe("AI 工具");
    expect(requests[0]).toMatchObject({
      url: "https://api.example.com/v1/chat/completions",
      method: "POST",
      headers: {
        Authorization: "Bearer sk-secret",
        "HTTP-Referer": "https://obsidian.md",
        "X-Title": "XHS Vault Sync"
      }
    });
    expect(JSON.parse((requests[0] as { body: string }).body)).toMatchObject({
      model: "test-model",
      temperature: 0,
      messages: expect.any(Array)
    });
  });

  it("returns null when the response category is not in the configured list", async () => {
    __setRequestUrlMock(vi.fn(async () => ({
      status: 200,
      json: { choices: [{ message: { content: "未知分类" } }] }
    })));

    await expect(
      classifyNoteCategory(
        {
          id: "note1",
          title: "标题",
          author: "",
          url: "https://example.com",
          tags: [],
          content: "正文",
          media: []
        },
        {
          apiKey: "sk-secret",
          baseUrl: "https://api.example.com/v1",
          model: "test-model",
          categories: ["AI 工具"]
        }
      )
    ).resolves.toBeNull();
  });
});
