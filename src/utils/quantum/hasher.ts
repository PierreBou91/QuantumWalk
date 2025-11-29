/**
 * Hashes a timestamp using SHA-256 via Web Crypto API
 * This ensures deterministic, cross-platform consistency
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashTimestamp(timestamp: number): Promise<string> {
  // Check if crypto.subtle is available (requires secure context: HTTPS or localhost)
  if (!crypto || !crypto.subtle) {
    throw new Error(
      'Web Crypto API is not available. This app requires HTTPS or localhost. ' +
      'If accessing from mobile, use HTTPS or see the documentation for setup instructions.'
    );
  }

  // Convert timestamp to string for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(timestamp.toString());

  try {
    // Use Web Crypto API for deterministic SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    throw new Error(
      `Failed to compute hash: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
      'This may be due to accessing the site over HTTP instead of HTTPS.'
    );
  }
}

/**
 * Validates that a hash string is properly formatted
 *
 * @param hash - Hash string to validate
 * @returns True if valid SHA-256 hash (64 hex characters)
 */
export function isValidHash(hash: string): boolean {
  return /^[0-9a-f]{64}$/i.test(hash);
}
