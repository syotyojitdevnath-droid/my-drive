import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/telegram/downloader", () => ({
  downloadFileToBuffer: vi.fn(async () => new Uint8Array([1, 2, 3])),
}));

import {
  clearImageCache,
  getCachedImageUrl,
  isBrowserImage,
  isCachedImageUrl,
  pinImageUrl,
  prefetchImage,
  putCachedImage,
} from "../imageCache";
import type { TeleFile } from "@/lib/types";

let counter = 0;
const file = (over: Partial<TeleFile> = {}): TeleFile => ({
  id: `f${++counter}`,
  name: `pic${counter}.jpg`,
  size: 1000,
  mime: "image/jpeg",
  folderPath: "/",
  messageId: counter,
  channelId: "c1",
  uploadedAt: 0,
  ...over,
});

beforeEach(() => {
  clearImageCache();
  let n = 0;
  vi.stubGlobal("URL", { createObjectURL: () => `blob:test-${++n}`, revokeObjectURL: vi.fn() });
});

describe("imageCache", () => {
  it("returns cached URLs and marks them as cache-owned", () => {
    const f = file();
    const url = putCachedImage(f, new Blob(["abc"]));
    expect(getCachedImageUrl(f)).toBe(url);
    expect(isCachedImageUrl(url)).toBe(true);
  });

  it("does not cache oversized images", () => {
    const f = file();
    const big = { size: 30 * 1024 * 1024 } as Blob;
    const url = putCachedImage(f, big);
    expect(getCachedImageUrl(f)).toBeUndefined();
    expect(isCachedImageUrl(url)).toBe(false);
  });

  it("evicts least recently used entries but never the pinned one", () => {
    const first = file();
    const firstUrl = putCachedImage(first, new Blob(["x"]));
    pinImageUrl(firstUrl);
    for (let i = 0; i < 45; i++) putCachedImage(file(), new Blob(["x"]));
    expect(getCachedImageUrl(first)).toBe(firstUrl);
  });

  it("prefetches into the cache and skips non-browser formats", async () => {
    const f = file();
    prefetchImage(f);
    await vi.waitFor(() => expect(getCachedImageUrl(f)).toBeDefined());
    const heic = file({ name: "a.heic", mime: "image/heic" });
    expect(isBrowserImage(heic)).toBe(false);
    prefetchImage(heic);
    expect(getCachedImageUrl(heic)).toBeUndefined();
  });
});
