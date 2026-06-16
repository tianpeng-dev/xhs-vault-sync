import { describe, expect, it } from "vitest";
import XhsVaultSyncPlugin from "../src/main";
import { createDefaultSettings } from "../src/settings";
import { SyncStatusModal } from "../src/ui/status-modal";

type ElementNode = HTMLElement & {
  children?: ElementNode[];
};

function collectText(element: ElementNode): string[] {
  const ownText = element.textContent ? [element.textContent] : [];
  const childText = [...(element.children ?? [])].flatMap((child) =>
    collectText(child)
  );
  return [...ownText, ...childText];
}

describe("SyncStatusModal", () => {
  it("展示状态、同步摘要、保存目录和最近 10 条非敏感日志", () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = {
      ...createDefaultSettings(),
      rootFolder: "RedNote/收藏",
      userId: "user-1",
      userName: "测试用户",
      activeSyncTarget: "album",
      lastSyncAt: new Date("2026-06-13T12:00:00Z").getTime(),
      syncedIds: {
        note1: true,
        note2: true,
        note3: true
      },
      syncStatusSnapshot: {
        phase: "complete",
        message: "同步完成",
        updatedAt: new Date("2026-06-13T12:00:00Z").getTime(),
        discoveredCount: 12,
        savedCount: 3,
        skippedCount: 9,
        currentIndex: 8,
        totalCount: 12,
        lastError: "token=secret_token_value_123456"
      },
      lastBookmarkDebug: {
        topLevelKeys: ["data"],
        dataKeys: ["notes"],
        noteCount: 12,
        hasMore: true,
        cursorPresent: true,
        codeType: "number",
        messagePresent: false,
        tokenCount: 4,
        sourceSummary: "收藏接口",
        itemKeySummary: "items",
        cardKeySummary: "note_card"
      },
      syncLog: Array.from({ length: 12 }, (_, index) => ({
        time: new Date(`2026-06-13T12:${String(index).padStart(2, "0")}:00Z`).getTime(),
        phase: "collecting" as const,
        message:
          index === 11
            ? '日志 11 token=secret_token_value_123456 raw_response: { "a1": "raw_a1_secret", "web_session": "raw_session_secret" }'
            : `日志 ${index}`
      }))
    };

    const modal = new SyncStatusModal(plugin);

    modal.open();

    const text = collectText(modal.contentEl as ElementNode).join("\n");
    expect(text).toContain("XHS Vault Sync 状态");
    expect(text).toContain("小红书：同步完成（已保存 3 条，已跳过 9 条）");
    expect(text).toContain("上次同步：");
    expect(text).toContain("当前账号：测试用户");
    expect(text).toContain("同步目标：专辑");
    expect(text).toContain("进度：8 / 12");
    expect(text).toContain("发现：12 条，保存：3 条，跳过：9 条");
    expect(text).toContain("最近错误：token=[redacted]");
    expect(text).toContain("已同步：3 条");
    expect(text).toContain("保存目录：RedNote/收藏");
    expect(text).toContain("最近采集摘要");
    expect(text).toContain("候选：12 条");
    expect(text).toContain("来源：收藏接口");
    expect(text).toContain("带访问令牌：4 条");
    expect(text).toContain("日志 11 token=[redacted]");
    expect(text).toContain("日志 2");
    expect(text).not.toMatch(/\b日志 1\b/);
    expect(text).not.toContain("secret_token_value_123456");
    expect(text).not.toContain("raw_response");
    expect(text).not.toContain("raw_a1_secret");
    expect(text).not.toContain("raw_session_secret");
    expect(text).not.toContain("web_session");
    expect(text).not.toContain("原始响应");
  });

  it("关闭时清空 Modal 内容", () => {
    const plugin = new XhsVaultSyncPlugin({} as never, {} as never);
    plugin.settings = createDefaultSettings();
    const modal = new SyncStatusModal(plugin);

    modal.open();
    expect(collectText(modal.contentEl as ElementNode).join("")).not.toBe("");

    modal.close();

    expect(collectText(modal.contentEl as ElementNode)).toEqual([]);
  });
});
