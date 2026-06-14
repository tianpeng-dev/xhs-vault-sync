import { describe, expect, it } from "vitest";
import { createDefaultSettings } from "../src/settings";
import {
  appendSyncLog,
  createIdleStatus,
  formatStatusLine,
  sanitizeStatusMessage
} from "../src/sync/status";
import type { SyncLogEntry } from "../src/sync/status";

describe("同步状态文本", () => {
  it("创建默认等待同步状态", () => {
    expect(createIdleStatus(0)).toEqual({
      phase: "idle",
      message: "等待同步",
      updatedAt: 0,
      discoveredCount: 0,
      savedCount: 0,
      skippedCount: 0
    });
  });

  it("未登录时显示固定状态", () => {
    expect(
      formatStatusLine({
        phase: "not_logged_in",
        message: "",
        updatedAt: 0,
        discoveredCount: 0,
        savedCount: 0,
        skippedCount: 0
      })
    ).toBe("小红书：未登录");
  });

  it("读取收藏时显示已发现数量", () => {
    expect(
      formatStatusLine({
        phase: "collecting",
        message: "",
        updatedAt: 0,
        discoveredCount: 12,
        savedCount: 0,
        skippedCount: 0
      })
    ).toBe("小红书：正在读取收藏（已发现 12 条）");
  });

  it("保存时显示当前进度", () => {
    expect(
      formatStatusLine({
        phase: "saving",
        message: "",
        updatedAt: 0,
        discoveredCount: 0,
        savedCount: 0,
        skippedCount: 0,
        currentIndex: 2,
        totalCount: 5
      })
    ).toBe("小红书：正在保存 2 / 5");
  });

  it("等待状态展示前会打码敏感文本", () => {
    expect(
      formatStatusLine({
        ...createIdleStatus(0),
        message: "等待同步 token=secret_token_value_123456"
      })
    ).toBe("小红书：等待同步 token=[redacted]");
  });
});

describe("同步日志工具", () => {
  it("追加日志时自动打码敏感文本", () => {
    const log = appendSyncLog([], {
      time: 1,
      phase: "failed",
      message: "同步失败 token=secret_token_value_123456"
    });

    expect(log).toEqual([
      {
        time: 1,
        phase: "failed",
        message: "同步失败 token=[redacted]"
      }
    ]);
  });

  it("只保留最新 50 条日志", () => {
    const log = Array.from({ length: 60 }, (_, index): SyncLogEntry => ({
      time: index,
      phase: "idle",
      message: `事件 ${index}`
    })).reduce<SyncLogEntry[]>((items, entry) => appendSyncLog(items, entry), []);

    expect(log).toHaveLength(50);
    expect(log[0].message).toBe("事件 10");
    expect(log[49].message).toBe("事件 59");
  });

  it("打码 cookie 与 token 类文本", () => {
    expect(
      sanitizeStatusMessage(
        "cookie=a1=abcdef1234567890abcdef token=secret_token_value_123456"
      )
    ).toBe("cookie=[redacted] token=[redacted]");
  });

  it("打码冒号、JSON 与 Authorization Header 形态", () => {
    expect(
      sanitizeStatusMessage(
        'token: secret_token_value_123456 "a1":"abcdef123456" Authorization: Bearer bearer_secret_123'
      )
    ).toBe('token: [redacted] "a1":"[redacted]" authorization: bearer [redacted]');
  });

  it("打码小红书访问令牌查询参数", () => {
    expect(
      sanitizeStatusMessage(
        "https://www.xiaohongshu.com/explore/note1?xsec_token=secret_xsec_value&source=web"
      )
    ).toBe("https://www.xiaohongshu.com/explore/note1?xsec_token=[redacted]&source=web");
  });
});

describe("同步状态默认设置", () => {
  it("包含新手引导与同步状态默认值", () => {
    const settings = createDefaultSettings();

    expect(settings.hasSeenOnboarding).toBe(false);
    expect(settings.syncStatusSnapshot).toEqual({
      phase: "idle",
      message: "等待同步",
      updatedAt: expect.any(Number),
      discoveredCount: 0,
      savedCount: 0,
      skippedCount: 0
    });
    expect(settings.syncLog).toEqual([]);
    expect(settings.lastSyncError).toBe("");
  });
});
