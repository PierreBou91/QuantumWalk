/**
 * Maximum interval duration (7 days in milliseconds)
 * This is configurable but should remain constant for determinism
 */
export const MAX_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 604,800,000 ms

/**
 * Converts a SHA-256 hash to a duration in milliseconds
 * Uses BigInt arithmetic to ensure cross-platform determinism
 *
 * Distribution: Uniform across [0, MAX_INTERVAL_MS)
 *
 * @param hash - SHA-256 hash (hex string)
 * @param maxInterval - Maximum interval in milliseconds (default: 7 days)
 * @returns Duration in milliseconds (integer)
 */
export function hashToDuration(
  hash: string,
  maxInterval: number = MAX_INTERVAL_MS
): number {
  // Take first 64 bits (16 hex characters) for entropy
  // This provides sufficient randomness while maintaining determinism
  const hexSubstring = hash.substring(0, 16);

  // Convert to BigInt for precise arithmetic
  const hashValue = BigInt('0x' + hexSubstring);

  // Maximum value for 64-bit unsigned integer
  const maxUint64 = BigInt('0xFFFFFFFFFFFFFFFF');

  // Normalize to [0, maxInterval) using BigInt to avoid floating-point precision issues
  const normalized = Number((hashValue * BigInt(maxInterval)) / maxUint64);

  // Return as integer milliseconds
  return Math.floor(normalized);
}

/**
 * Converts a duration to a human-readable string
 *
 * @param durationMs - Duration in milliseconds
 * @returns Formatted string (e.g., "3d 14h 23m")
 */
export function formatDuration(durationMs: number): string {
  const days = Math.floor(durationMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((durationMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((durationMs % (60 * 1000)) / 1000);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

/**
 * Parses a duration string into milliseconds
 * Supports formats like: "3d 14h 23m", "2.5d", "48h"
 *
 * @param durationStr - Duration string
 * @returns Duration in milliseconds
 */
export function parseDuration(durationStr: string): number {
  let totalMs = 0;

  // Match patterns like "3d", "14h", "23m", "45s", "2.5d"
  const pattern = /(\d+\.?\d*)\s*([dhms])/gi;
  let match;

  while ((match = pattern.exec(durationStr)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'd':
        totalMs += value * 24 * 60 * 60 * 1000;
        break;
      case 'h':
        totalMs += value * 60 * 60 * 1000;
        break;
      case 'm':
        totalMs += value * 60 * 1000;
        break;
      case 's':
        totalMs += value * 1000;
        break;
    }
  }

  return Math.floor(totalMs);
}
