import type { TeleFile } from "@/lib/types";
import { downloadFileToBuffer } from "@/lib/telegram/downloader";

/**
 * In-memory LRU cache of decoded-ready image blobs for the preview viewer.
 * Re-opening or flipping back to an image is instant, and neighbouring images
 * are prefetched in the background so "next" feels immediate.
 */

const MAX_ENTRY_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_BYTES = 160 * 1024 * 1024;
const MAX_ENTRIES = 40;
const MAX_PARALLEL_PREFETCH = 2;

const BROWSER_IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif", "svg"]);
const BROWSER_IMAGE_MIMES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/avif", "image/svg+xml",
]);

interface Entry {
  url: string;
  bytes: number;
}

const cache = new Map<string, Entry>(); // insertion order = least recently used first
const cachedUrls = new Set<string>();
const inflight = new Set<string>();
const queue: Array<() => void> = [];
let running = 0;
let total = 0;
let pinnedUrl: string | null = null;

function fileExt(file: Pick<TeleFile, "name">): string {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function keyOf(file: Pick<TeleFile, "channelId" | "messageId" | "size">): string {
  return `${file.channelId}:${file.messageId}:${file.size}`;
}

/** True for image formats every webview can render directly (no HEIC / RAW / PSD). */
export function isBrowserImage(file: Pick<TeleFile, "name" | "mime">): boolean {
  const mime = (file.mime || "").toLowerCase();
  return BROWSER_IMAGE_MIMES.has(mime) || BROWSER_IMAGE_EXTS.has(fileExt(file));
}

export function imageBlobMime(file: Pick<TeleFile, "name" | "mime">): string {
  const ext = fileExt(file);
  if (ext === "svg") return "image/svg+xml";
  if ((file.mime || "").startsWith("image/")) return file.mime;
  return `image/${ext === "jpg" ? "jpeg" : ext || "png"}`;
}

export function getCachedImageUrl(file: TeleFile): string | undefined {
  const key = keyOf(file);
  const hit = cache.get(key);
  if (!hit) return undefined;
  cache.delete(key); // refresh LRU position
  cache.set(key, hit);
  return hit.url;
}

/** True when the URL is owned by this cache and must not be revoked by callers. */
export function isCachedImageUrl(url: string | null | undefined): boolean {
  return !!url && cachedUrls.has(url);
}

/** Marks the URL currently on screen so it is never evicted underneath the viewer. */
export function pinImageUrl(url: string | null): void {
  pinnedUrl = url;
}

function evict(): void {
  while (total > MAX_TOTAL_BYTES || cache.size > MAX_ENTRIES) {
    let removed = false;
    for (const [key, entry] of cache) {
      if (entry.url === pinnedUrl) continue;
      cache.delete(key);
      cachedUrls.delete(entry.url);
      URL.revokeObjectURL(entry.url);
      total -= entry.bytes;
      removed = true;
      break;
    }
    if (!removed) break;
  }
}

/** Stores the blob and returns its object URL (uncached, caller-owned URL if it is too large). */
export function putCachedImage(file: TeleFile, blob: Blob): string {
  const url = URL.createObjectURL(blob);
  if (blob.size > MAX_ENTRY_BYTES) return url;
  const key = keyOf(file);
  const existing = cache.get(key);
  if (existing) {
    cache.delete(key);
    cachedUrls.delete(existing.url);
    total -= existing.bytes;
    if (existing.url !== pinnedUrl) URL.revokeObjectURL(existing.url);
  }
  cache.set(key, { url, bytes: blob.size });
  cachedUrls.add(url);
  total += blob.size;
  evict();
  return url;
}

function runNext(): void {
  while (running < MAX_PARALLEL_PREFETCH && queue.length > 0) {
    running += 1;
    queue.shift()!();
  }
}

/** Downloads an image in the background so it opens instantly later. Failures are silent. */
export function prefetchImage(file: TeleFile): void {
  if (!isBrowserImage(file) || file.offline || file.size <= 0 || file.size > MAX_ENTRY_BYTES) return;
  const key = keyOf(file);
  if (cache.has(key) || inflight.has(key)) return;
  inflight.add(key);

  queue.push(() => {
    void (async () => {
      try {
        if (cache.has(key)) return;
        const buffer = await downloadFileToBuffer(file.channelId, file.messageId, undefined, undefined, {
          segments: file.segments,
          enc: file.enc,
          plainSize: file.enc?.plainSize ?? file.size,
        });
        putCachedImage(file, new Blob([buffer as any], { type: imageBlobMime(file) }));
      } catch {
        // Prefetch is best-effort only.
      } finally {
        inflight.delete(key);
        running -= 1;
        runNext();
      }
    })();
  });
  runNext();
}

export function clearImageCache(): void {
  for (const entry of cache.values()) URL.revokeObjectURL(entry.url);
  cache.clear();
  cachedUrls.clear();
  inflight.clear();
  queue.length = 0;
  total = 0;
  pinnedUrl = null;
}
