/**
 * Structured URL parser. Returns a normalized object describing every part of
 * a URL — protocol, auth, host, port, path, query, fragment — plus a parsed
 * query object.
 *
 * Works in any environment that has the WHATWG `URL` constructor
 * (browsers, Node 16+, Deno, Bun, edge runtimes).
 */

import { createSafeObject, isPrototypePollutionKey } from '../shared/security.js';

export interface ParsedUrl {
  /** Original input string. */
  input: string;
  /** Scheme without the trailing colon, e.g. `https`. */
  protocol: string;
  /** Authentication component, e.g. `user:pass`. Undefined if not present. */
  auth: string | undefined;
  /** Username portion of `auth`. Undefined if not present. */
  username: string | undefined;
  /** Password portion of `auth`. Undefined if not present. */
  password: string | undefined;
  /** Hostname (lowercased). */
  hostname: string;
  /** Port as a string, or empty string when using the scheme default. */
  port: string;
  /** `protocol + // + hostname + :port` (no trailing slash). */
  origin: string;
  /** Pathname starting with `/` (or empty string). */
  pathname: string;
  /** Search string including leading `?`, or empty string. */
  search: string;
  /** Hash including leading `#`, or empty string. */
  hash: string;
  /** Query string without the leading `?`. */
  queryString: string;
  /**
   * Parsed query parameters. Repeated keys collapse into arrays.
   * (Use `query-string` directly for richer semantics.)
   */
  query: Record<string, string | string[]>;
}

const QUERY_SPLIT = /[&;]/;

function parseQuery(qs: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = createSafeObject();
  if (!qs) return out;
  const parts = qs.split(QUERY_SPLIT);
  for (const part of parts) {
    if (!part) continue;
    const eq = part.indexOf('=');
    const rawKey = eq === -1 ? part : part.slice(0, eq);
    const rawVal = eq === -1 ? '' : part.slice(eq + 1);
    const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
    const val = decodeURIComponent(rawVal.replace(/\+/g, ' '));
    if (isPrototypePollutionKey(key)) continue;
    const existing = out[key];
    if (existing === undefined) {
      out[key] = val;
    } else if (Array.isArray(existing)) {
      existing.push(val);
    } else {
      out[key] = [existing, val];
    }
  }
  return out;
}

/**
 * Parse a URL string into a structured object.
 *
 * Throws if the input is not a valid absolute URL.
 *
 * @example
 * parseUrl('https://user:pass@example.com:8080/path?a=1&a=2#frag')
 * // => { protocol: 'https', username: 'user', password: 'pass', ... }
 */
export function parseUrl(input: string): ParsedUrl {
  if (typeof input !== 'string') {
    throw new TypeError(`parseUrl: input must be a string, got ${typeof input}`);
  }

  // base href allows parsing of relative URLs against a known origin.
  const url = new URL(input);

  const queryString = url.search.startsWith('?') ? url.search.slice(1) : url.search;

  return {
    input,
    protocol: url.protocol.replace(/:$/, ''),
    auth: url.username || url.password ? `${url.username}${url.password ? `:${url.password}` : ''}` : undefined,
    username: url.username || undefined,
    password: url.password || undefined,
    hostname: url.hostname,
    port: url.port,
    origin: url.origin,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    queryString,
    query: parseQuery(queryString),
  };
}

/**
 * Safe variant of {@link parseUrl}. Returns `null` instead of throwing.
 */
export function tryParseUrl(input: string): ParsedUrl | null {
  try {
    return parseUrl(input);
  } catch {
    return null;
  }
}

/**
 * Returns the parts needed to rebuild the URL with `URL#toString`.
 * Mostly here so consumers can re-stringify a `ParsedUrl` after editing fields.
 */
export function toUrlString(parts: ParsedUrl): string {
  const url = new URL(parts.input);
  if (parts.protocol) url.protocol = `${parts.protocol}:`;
  if (parts.username || parts.password) {
    url.username = parts.username ?? '';
    url.password = parts.password ?? '';
  }
  if (parts.hostname) url.hostname = parts.hostname;
  if (parts.port) url.port = parts.port;
  if (parts.pathname) url.pathname = parts.pathname;
  if (parts.queryString !== undefined) url.search = parts.queryString ? `?${parts.queryString}` : '';
  if (parts.hash) url.hash = parts.hash;
  return url.toString();
}
