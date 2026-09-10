/**
 * Build and parse URL query strings. Supports arrays, nested objects,
 * custom delimiters, and the common `bracket` / `index` / `comma` array styles.
 *
 * All keys and values are URI-decoded on parse and URI-encoded on stringify.
 * Plus signs are treated as spaces on parse (matches `application/x-www-form-urlencoded`).
 */

import { createSafeObject, isPrototypePollutionKey } from '../shared/security.js';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryArrayValue = QueryValue | QueryArrayValue[];
export type QueryInput = QueryValue | QueryArrayValue[] | { [key: string]: QueryInput };

export type ArrayFormat = 'none' | 'bracket' | 'index' | 'comma';

export interface StringifyOptions {
  /** How to serialize array values. Default: `'none'` (repeat the key). */
  arrayFormat?: ArrayFormat;
  /** Separator between pairs. Default: `'&'`. */
  delimiter?: string;
  /** When true, skip `null`/`undefined` values. Default: `true`. */
  skipNulls?: boolean;
  /** When true, do not URI-encode keys/values. Default: `false`. */
  encode?: boolean;
  /** Encode function override. */
  encoder?: (value: string) => string;
}

export interface ParseOptions {
  /** Separator between pairs. Default: `'&'`. */
  delimiter?: string | RegExp;
  /** Decode function override. */
  decoder?: (value: string) => string;
  /** When true, treat `+` as a space. Default: `true`. */
  plusAsSpace?: boolean;
  /** When true, also parse bracketed arrays (`a[]=1&a[]=2`). Default: `true`. */
  parseArrays?: boolean;
  /** Depth limit for nested objects. Default: `5`. */
  depth?: number;
}

const DEFAULT_DELIMITER = '&';
const DEFAULT_DEPTH = 5;

const PLUS_RE = /\+/g;

function defaultEncoder(value: string): string {
  return encodeURIComponent(value);
}

function defaultDecoder(value: string): string {
  return decodeURIComponent(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stringifyPrimitive(v: unknown, encoder: (s: string) => string): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (Array.isArray(v)) return undefined;
  if (isObject(v)) return undefined;
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return undefined;
    return encoder(String(v));
  }
  if (typeof v === 'boolean') return encoder(v ? 'true' : 'false');
  return encoder(String(v));
}

function stringifyPair(
  key: string,
  value: QueryInput,
  options: Required<Pick<StringifyOptions, 'arrayFormat' | 'delimiter' | 'skipNulls' | 'encode'>> & {
    encoder: (s: string) => string;
  },
  out: string[],
): void {
  const { arrayFormat, skipNulls, encoder } = options;

  if (value === null || value === undefined) {
    if (!skipNulls) out.push(`${encoder(key)}=`);
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      if (!skipNulls) out.push(`${encoder(key)}=`);
      return;
    }
    switch (arrayFormat) {
      case 'bracket': {
        for (const v of value) {
          const enc = stringifyPrimitive(v, encoder);
          if (enc === undefined) {
            if (!skipNulls) out.push(`${encoder(`${key}[]`)}=`);
          } else {
            out.push(`${encoder(`${key}[]`)}=${enc}`);
          }
        }
        return;
      }
      case 'index': {
        for (let i = 0; i < value.length; i++) {
          const v = value[i] as QueryInput;
          const enc = stringifyPrimitive(v, encoder);
          if (enc === undefined) {
            if (!skipNulls) out.push(`${encoder(`${key}[${i}]`)}=`);
          } else {
            out.push(`${encoder(`${key}[${i}]`)}=${enc}`);
          }
        }
        return;
      }
      case 'comma': {
        const parts: string[] = [];
        for (const v of value) {
          const enc = stringifyPrimitive(v, encoder);
          if (enc !== undefined) parts.push(enc);
        }
        out.push(`${encoder(key)}=${parts.join(',')}`);
        return;
      }
      case 'none':
      default: {
        for (const v of value) {
          const enc = stringifyPrimitive(v, encoder);
          if (enc === undefined) {
            if (!skipNulls) out.push(`${encoder(key)}=`);
          } else {
            out.push(`${encoder(key)}=${enc}`);
          }
        }
        return;
      }
    }
  }

  if (isObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      stringifyPair(`${key}[${k}]`, v as QueryInput, options, out);
    }
    return;
  }

  const enc = stringifyPrimitive(value as QueryValue, encoder);
  if (enc === undefined) {
    if (!skipNulls) out.push(`${encoder(key)}=`);
  } else {
    out.push(`${encoder(key)}=${enc}`);
  }
}

/**
 * Stringify a value into a query string.
 *
 * @example
 * stringify({ a: 1, b: ['x', 'y'], c: { d: 'z' } })
 * // => 'a=1&b=x&b=y&c[d]=z'
 */
export function stringify(
  value: Record<string, QueryInput> | URLSearchParams,
  options: StringifyOptions = {},
): string {
  const arrayFormat: ArrayFormat = options.arrayFormat ?? 'none';
  const delimiter = options.delimiter ?? DEFAULT_DELIMITER;
  const skipNulls = options.skipNulls ?? true;
  const encoder = options.encoder ?? defaultEncoder;

  const out: string[] = [];
  const opts = { arrayFormat, delimiter, skipNulls, encode: options.encode ?? true, encoder };

  if (value instanceof URLSearchParams) {
    // Preserve order and any pre-encoded shape.
    for (const [k, v] of value.entries()) {
      out.push(`${encoder(k)}=${encoder(v)}`);
    }
  } else if (isObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      stringifyPair(k, v as QueryInput, opts, out);
    }
  }

  return out.join(delimiter);
}

function parseTokens(input: string, delimiter: string | RegExp): string[] {
  if (input === '') return [];
  const re = typeof delimiter === 'string' ? new RegExp(`[${escapeRegex(delimiter)}]`) : delimiter;
  return input.split(re).filter(Boolean);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface ParsedToken {
  key: string;
  value: string;
}

function tokenize(part: string, decoder: (s: string) => string, plusAsSpace: boolean): ParsedToken {
  const eq = part.indexOf('=');
  const rawKey = eq === -1 ? part : part.slice(0, eq);
  const rawVal = eq === -1 ? '' : part.slice(eq + 1);
  const fix = (s: string): string => (plusAsSpace ? s.replace(PLUS_RE, ' ') : s);
  return { key: decoder(fix(rawKey)), value: decoder(fix(rawVal)) };
}

function assign(
  target: Record<string, unknown>,
  key: string,
  value: string,
  parseArrays: boolean,
  depth: number,
): void {
  if (isPrototypePollutionKey(key)) return;

  if (depth <= 0) {
    target[key] = mergeValue(target[key], value);
    return;
  }

  // bracket form: head[index]rest
  const bracketMatch = /^(.+?)\[([^\]]*)\](.*)$/.exec(key);
  if (bracketMatch) {
    const [, head, index, rest] = bracketMatch as unknown as [string, string, string, string];
    if (!head || isPrototypePollutionKey(head)) return;
    if (index && isPrototypePollutionKey(index)) return;
    const nextKey = rest ? `${index}${rest}` : index;

    if (nextKey === '') {
      // a[]=v — array form
      if (!parseArrays) {
        target[head] = mergeValue(target[head], value);
        return;
      }
      const existing = target[head];
      if (existing === undefined) {
        target[head] = [value];
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else if (isObject(existing)) {
        // Promote an existing object under the same key to an array,
        // prepending the earlier object's values in insertion order.
        target[head] = [existing, value];
      } else {
        target[head] = [existing, value];
      }
      return;
    }

    // head[index]... — nested object (or explicit index)
    if (!(head in target) || !isObject(target[head]) || Array.isArray(target[head])) {
      // If `head` is a primitive or an array, restart it as a safe object.
      target[head] = createSafeObject();
    }
    assign(target[head] as Record<string, unknown>, nextKey, value, parseArrays, depth - 1);
    return;
  }

  target[key] = mergeValue(target[key], value);
}

function mergeValue(existing: unknown, value: string): unknown {
  if (existing === undefined) return value;
  if (Array.isArray(existing)) return [...existing, value];
  return [existing, value];
}

/**
 * Parse a query string into an object.
 *
 * @example
 * parse('a=1&b=x&b=y&c[d]=z')
 * // => { a: '1', b: ['x', 'y'], c: { d: 'z' } }
 */
export function parse(
  input: string,
  options: ParseOptions = {},
): Record<string, unknown> {
  const delimiter = options.delimiter ?? DEFAULT_DELIMITER;
  const decoder = options.decoder ?? defaultDecoder;
  const plusAsSpace = options.plusAsSpace ?? true;
  const parseArrays = options.parseArrays ?? true;
  const depth = options.depth ?? DEFAULT_DEPTH;

  const out: Record<string, unknown> = createSafeObject();
  if (typeof input !== 'string' || input === '') return out;

  // strip leading '?' if present
  const cleaned = input.startsWith('?') ? input.slice(1) : input;
  const tokens = parseTokens(cleaned, delimiter);
  for (const token of tokens) {
    const { key, value } = tokenize(token, decoder, plusAsSpace);
    if (key === '' || isPrototypePollutionKey(key)) continue;
    assign(out, key, value, parseArrays, depth);
  }

  return out;
}

/**
 * Append params to a base URL, preserving the existing query string.
 * Any keys already present are overwritten.
 */
export function appendParams(
  baseUrl: string,
  params: Record<string, QueryInput>,
  options: StringifyOptions = {},
): string {
  const url = new URL(baseUrl);
  const existing = parse(url.search.slice(1), {
    delimiter: options.delimiter ?? DEFAULT_DELIMITER,
  });
  const merged = { ...(existing as Record<string, QueryInput>), ...params };
  url.search = stringify(merged, options);
  return url.toString();
}

/**
 * Remove the given keys from a query string. Other keys are preserved.
 */
export function removeParams(baseUrl: string, keys: string[]): string {
  const url = new URL(baseUrl);
  const sp = url.searchParams;
  for (const k of keys) sp.delete(k);
  return url.toString();
}
