import { requestUrl } from "obsidian";
import type { XhsNote } from "./types";

export interface AiClassifyOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  categories: string[];
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function normalizeBaseUrl(value: string): string {
  return (value.trim() || "https://api.openai.com/v1").replace(/\/+$/, "");
}

function normalizeCategory(value: string): string {
  return value.trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, "");
}

export async function classifyNoteCategory(
  note: XhsNote,
  options: AiClassifyOptions
): Promise<string | null> {
  const categories = options.categories.map(normalizeCategory).filter(Boolean);
  if (!options.apiKey.trim() || !categories.length) return null;

  const body = {
    model: options.model.trim() || "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: [
          "你是小红书笔记分类器。",
          "只能从候选分类中返回一个最匹配的分类名称。",
          "不要解释，不要输出候选分类之外的内容。"
        ].join("\n")
      },
      {
        role: "user",
        content: [
          `候选分类：${categories.join("、")}`,
          `标题：${note.title}`,
          `标签：${note.tags.join("、") || "无"}`,
          `正文：${note.content.slice(0, 2000) || "无"}`
        ].join("\n")
      }
    ]
  };

  const response = await requestUrl({
    url: `${normalizeBaseUrl(options.baseUrl)}/chat/completions`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
      "HTTP-Referer": "https://obsidian.md",
      "X-Title": "XHS Vault Sync"
    },
    body: JSON.stringify(body),
    throw: false
  });

  if (response.status >= 400) throw new Error(`AI classify HTTP ${response.status}`);
  const data = response.json as ChatCompletionResponse;
  const category = normalizeCategory(data.choices?.[0]?.message?.content ?? "");
  return categories.includes(category) ? category : null;
}
