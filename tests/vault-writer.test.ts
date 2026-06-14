import { describe, expect, it, vi } from "vitest";
import { TFile, TFolder } from "./mocks/obsidian";
import { VaultWriter } from "../src/vault/vault-writer";
import type { XhsNote } from "../src/sync/types";

function createAppMock() {
  const files = new Map<string, TFile>();
  const folders = new Set<string>();

  return {
    vault: {
      getAbstractFileByPath: vi.fn((path: string) => {
        if (files.has(path)) return files.get(path);
        if (folders.has(path)) return new TFolder();
        return null;
      }),
      createFolder: vi.fn(async (path: string) => {
        folders.add(path);
      }),
      create: vi.fn(async (path: string) => {
        const file = new TFile();
        files.set(path, file);
      }),
      modify: vi.fn(),
      delete: vi.fn(),
      createBinary: vi.fn()
    }
  };
}

describe("VaultWriter", () => {
  it("uses note id in markdown filenames to avoid title collisions", async () => {
    const app = createAppMock();
    const writer = new VaultWriter(app as never, "RedNote");
    const baseNote: XhsNote = {
      id: "note-a",
      title: "Same title",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note-a",
      tags: [],
      content: "hello",
      media: []
    };

    await writer.writeNote(baseNote);
    await writer.writeNote({ ...baseNote, id: "note-b" });

    expect(app.vault.create).toHaveBeenCalledWith(expect.stringContaining("Same title-note-a.md"), expect.any(String));
    expect(app.vault.create).toHaveBeenCalledWith(expect.stringContaining("Same title-note-b.md"), expect.any(String));
  });

  it("prefixes markdown filenames with zero-padded sync index", async () => {
    const app = createAppMock();
    const writer = new VaultWriter(app as never, "RedNote");

    await writer.writeNote({
      id: "note-a",
      title: "Same title",
      author: "Alice",
      url: "https://www.xiaohongshu.com/explore/note-a",
      tags: [],
      content: "hello",
      media: [],
      syncIndex: 12
    });

    expect(app.vault.create).toHaveBeenCalledWith(expect.stringContaining("0012-Same title-note-a.md"), expect.any(String));
  });
});
