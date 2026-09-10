import { describe, it, expect } from 'vitest';
import {
  encodeComponent,
  decodeComponent,
  encodeComponentKeep,
  encodeFull,
  decodeFull,
  encodePath,
  isEncoded,
  isFullyEncoded,
  diffEncoded,
} from './index.js';

describe('encodeComponent / decodeComponent', () => {
  it('encodes spaces, slashes, and special characters', () => {
    expect(encodeComponent('hello world/!')).toBe('hello%20world%2F!');
  });

  it('decodes percent sequences', () => {
    expect(decodeComponent('hello%20world%2F')).toBe('hello world/');
  });

  it('round-trips UTF-8', () => {
    const s = 'résumé & résumé';
    expect(decodeComponent(encodeComponent(s))).toBe(s);
  });
});

describe('encodeComponentKeep', () => {
  it('preserves the listed characters', () => {
    expect(encodeComponentKeep('a:b/c', { keep: ':' })).toBe('a:b%2Fc');
  });

  it('preserves multiple characters', () => {
    expect(encodeComponentKeep('user@example.com/path', { keep: '@./' })).toBe(
      'user@example.com/path',
    );
  });

  it('encodes everything not in the keep set', () => {
    expect(encodeComponentKeep('a:b?c=d', { keep: ':' })).toBe('a:b%3Fc%3Dd');
  });
});

describe('encodeFull / decodeFull', () => {
  it('encodes only the unsafe bits of a full URL', () => {
    const u = 'https://example.com/path with space?q=1';
    expect(encodeFull(u)).toBe('https://example.com/path%20with%20space?q=1');
    expect(decodeFull(encodeFull(u))).toBe(u);
  });
});

describe('encodePath', () => {
  it('encodes slashes', () => {
    expect(encodePath('foo/bar baz')).toBe('foo%2Fbar%20baz');
  });
});

describe('isEncoded / isFullyEncoded', () => {
  it('detects at least one triplet', () => {
    expect(isEncoded('hello%20world')).toBe(true);
    expect(isEncoded('hello world')).toBe(false);
  });

  it('isFullyEncoded is stricter', () => {
    expect(isFullyEncoded('hello%20world')).toBe(true);
    expect(isFullyEncoded('hello world')).toBe(false);
    expect(isFullyEncoded('a/b%20c')).toBe(false);
  });
});

describe('diffEncoded', () => {
  it('identifies characters that changed into percent-encodings', () => {
    const before = 'hello world!';
    const after = encodeComponent(before);
    expect(diffEncoded(before, after)).toContain(' ');
  });
});
