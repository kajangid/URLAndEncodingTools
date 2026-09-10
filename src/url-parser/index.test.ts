import { describe, it, expect } from 'vitest';
import { parseUrl, tryParseUrl, toUrlString } from './index.js';

describe('url-parser', () => {
  it('parses a full URL with auth, port, query and hash', () => {
    const r = parseUrl('https://user:pass@example.com:8080/path/to?a=1&a=2#frag');
    expect(r.protocol).toBe('https');
    expect(r.username).toBe('user');
    expect(r.password).toBe('pass');
    expect(r.auth).toBe('user:pass');
    expect(r.hostname).toBe('example.com');
    expect(r.port).toBe('8080');
    expect(r.origin).toBe('https://example.com:8080');
    expect(r.pathname).toBe('/path/to');
    expect(r.queryString).toBe('a=1&a=2');
    expect(r.query).toEqual({ a: ['1', '2'] });
    expect(r.hash).toBe('#frag');
  });

  it('decodes + as space in query', () => {
    const r = parseUrl('https://example.com/?q=hello+world');
    expect(r.query).toEqual({ q: 'hello world' });
  });

  it('preserves the original input', () => {
    const r = parseUrl('https://example.com/');
    expect(r.input).toBe('https://example.com/');
  });

  it('throws on invalid input', () => {
    expect(() => parseUrl('not a url')).toThrow();
  });

  it('throws on non-string input', () => {
    expect(() => parseUrl(123 as unknown as string)).toThrow(TypeError);
  });

  it('tryParseUrl returns null on invalid input', () => {
    expect(tryParseUrl('invalid')).toBeNull();
  });

  it('toUrlString round-trips correctly', () => {
    const p = parseUrl('https://example.com/path?a=1#hash');
    p.pathname = '/other';
    expect(toUrlString(p)).toBe('https://example.com/other?a=1#hash');
  });
});
