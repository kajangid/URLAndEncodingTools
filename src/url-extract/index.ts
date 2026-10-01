/**
 * URL Extraction utility.
 *
 * Extracts HTTP(S), FTP, and file URLs as well as www.* domain patterns
 * from arbitrary text with trailing punctuation trimming and WHATWG URL validation.
 */

export interface ExtractOptions {
  /** Protocols to match (lowercase, without '://'). Default: ['http', 'https'] */
  protocols?: string[];
  /** Allow domain-like URLs starting with 'www.' (auto-prefixes 'https://'). Default: true */
  allowWww?: boolean;
  /** Deduplicate extracted URLs preserving appearance order. Default: true */
  unique?: boolean;
  /** Normalize URLs via WHATWG URL.href (e.g. lowercase host, trailing slash). Default: false */
  normalize?: boolean;
}

export function extractUrls(text: string, options: ExtractOptions = {}): string[] {
  if (typeof text !== 'string' || text.length === 0) return [];

  const {
    protocols = ['http', 'https'],
    allowWww = true,
    unique = true,
    normalize = false,
  } = options;

  // Match candidate URLs starting with scheme:// or www.
  const re = /(?:https?|ftp|file):\/\/[^\s<>"'`{}|\\^]+|\bwww\.[^\s<>"'`{}|\\^]+/gi;
  const matches = text.match(re) || [];
  const results: string[] = [];
  const seen = new Set<string>();

  for (let raw of matches) {
    // Strip trailing sentence punctuation: , . ! ? : ; > unless part of balanced parens
    while (
      /[.,!?:;>]$/.test(raw) ||
      (raw.endsWith(')') && raw.split(')').length > raw.split('(').length)
    ) {
      raw = raw.slice(0, -1);
    }

    const isWww = raw.startsWith('www.');
    if (isWww && !allowWww) continue;

    const candidate = isWww ? `https://${raw}` : raw;

    try {
      const parsed = new URL(candidate);
      const scheme = parsed.protocol.replace(':', '').toLowerCase();

      if (!protocols.includes(scheme)) continue;

      const output = normalize ? parsed.href : candidate;
      const key = output.toLowerCase();

      if (unique && seen.has(key)) continue;
      if (unique) seen.add(key);

      results.push(output);
    } catch {
      // Invalid URL syntax according to WHATWG URL spec; skip
    }
  }

  return results;
}

export function hasUrls(text: string, options?: ExtractOptions): boolean {
  return extractUrls(text, options).length > 0;
}
