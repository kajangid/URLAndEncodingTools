/**
 * URI component / full URL encoding utilities. Thin wrappers over the
 * platform's `encodeURIComponent` / `decodeURIComponent` / `encodeURI` /
 * `decodeURI`, plus a few opinionated variants useful in the wild:
 *
 * - `encodeComponent` / `decodeComponent` — strict component encoding
 *   (encodes everything `encodeURIComponent` does).
 * - `encodeComponentKeep` — like `encodeComponent` but preserves a
 *   user-supplied set of reserved characters (e.g. `:`, `/`, `@`).
 * - `encodeFull` / `decodeFull` — encode/decode an entire URL.
 * - `encodePath` — encodes one URL path segment.
 * - `isEncoded` / `isFullyEncoded` — heuristic detection.
 */

export interface EncodeOptions {
  /** Characters that should NOT be percent-encoded. */
  keep?: string;
}

// Unreserved: A-Z a-z 0-9 - _ . ~ (RFC 3986 §2.3). Nothing else is "always safe".
const UNRESERVED_RE = /[^A-Za-z0-9\-._~]/g;

function buildAllowSet(keep: string): Set<string> {
  const allow = new Set<string>();
  for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~') allow.add(c);
  for (const c of keep) allow.add(c);
  return allow;
}

function percentEncodeChar(c: string): string {
  // Convert to UTF-8 bytes, then percent-encode each byte.
  const bytes = new TextEncoder().encode(c);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += `%${(bytes[i] as number).toString(16).toUpperCase().padStart(2, '0')}`;
  }
  return out;
}

/**
 * Percent-encode a single URL component. Encodes everything that isn't
 * unreserved plus the standard reserved set.
 *
 * @example
 * encodeComponent('hello world?')
 * // => 'hello%20world%3F'
 */
export function encodeComponent(input: string): string {
  return encodeURIComponent(input);
}

/**
 * Decode a single URL component. Throws on malformed sequences.
 */
export function decodeComponent(input: string): string {
  return decodeURIComponent(input);
}

/**
 * Like `encodeComponent`, but preserves the given characters instead of
 * percent-encoding them. Useful for IDN/email-style transforms.
 *
 * @example
 * encodeComponentKeep('a:b/c', { keep: ':' })
 * // => 'a:b%2Fc'
 */
export function encodeComponentKeep(input: string, options: EncodeOptions = {}): string {
  if (!options.keep) return encodeComponent(input);
  const allow = buildAllowSet(options.keep);
  let out = '';
  for (const ch of input) {
    if (allow.has(ch)) out += ch;
    else out += percentEncodeChar(ch);
  }
  return out;
}

/**
 * Percent-encode an entire URL. Use this only for individual pieces; for
 * most workflows prefer the native `URL` constructor.
 */
export function encodeFull(input: string): string {
  return encodeURI(input);
}

/** Decode a full URL. */
export function decodeFull(input: string): string {
  return decodeURI(input);
}

/**
 * Encode one URL path segment. Encodes more aggressively than
 * `encodeComponent` — `/` and `?` get percent-encoded too, since they
 * have path-level meaning. Only unreserved characters survive.
 */
export function encodePath(input: string): string {
  return input.replace(UNRESERVED_RE, percentEncodeChar);
}

/**
 * Heuristic: does the string look like it has been percent-encoded at all?
 * Returns true if at least one valid `%XX` triplet is present.
 */
export function isEncoded(input: string): boolean {
  return /%[0-9A-Fa-f]{2}/.test(input);
}

/**
 * Heuristic: is every non-unreserved character percent-encoded? Useful for
 * sanity-checking pre-built query values before concatenation.
 */
export function isFullyEncoded(input: string): boolean {
  // Anything that isn't unreserved or a valid percent-triplet is unencoded.
  return !/[^A-Za-z0-9\-._~%]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f](?:[^0-9A-Fa-f]|$))/.test(input);
}

/** Difference between two encoded strings. Returns characters that became encoded. */
export function diffEncoded(before: string, after: string): string[] {
  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < before.length && j < after.length) {
    const a = before[i];
    const b = after[j];
    if (a === b) {
      i++;
      j++;
      continue;
    }
    if (b === '%' && after.slice(j, j + 3).toLowerCase() === `%${a!.charCodeAt(0).toString(16).padStart(2, '0')}`) {
      out.push(a!);
      j += 3;
      i++;
    } else {
      i++;
      j++;
    }
  }
  return out;
}
