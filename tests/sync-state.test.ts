import { describe, expect, it } from "vitest";
import { markNoteSynced, shouldSyncNote } from "../src/sync/sync-engine";

describe("sync state helpers", () => {
  it("skips already synced note ids", () => {
    expect(shouldSyncNote({ note1: true }, "note1")).toBe(false);
    expect(shouldSyncNote({ note1: true }, "note2")).toBe(true);
  });

  it("marks a note id as synced", () => {
    const state: Record<string, true> = {};
    markNoteSynced(state, "note1");
    expect(state).toEqual({ note1: true });
  });
});
