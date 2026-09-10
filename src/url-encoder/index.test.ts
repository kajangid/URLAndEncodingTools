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

describe('url-encoder', () => {
  it('encodes spaces and special characters', () => {
    expect(encodeComponent('hello world/!')).toBe('hello%20world%2F!');
  });

  it('decodes percent sequences', () => {
    expect(decodeComponent('hello%20world%2F')).toBe('hello world/');
  });

  it('round-trips UTF-8', () => {
    const s = 'résumé & résumé';
    expect(decodeComponent(encodeComponent(s))).toBe(s);
  });

  it('preserves keep set in encodeComponentKeep', () => {
    expect(encodeComponentKeep('a:b/c', { keep: ':' })).toBe('a:b%2Fc');
    expect(encodeComponentKeep('user@example.com/path', { keep: '@./' })).toBe('user@example.com/path');
    expect(encodeComponentKeep('a:b?c=d', { keep: ':' })).toBe('a:b%3Fc%3Dd');
  });

  it('encodeFull and decodeFull', () => {
    const u = 'https://example.com/path with space?q=1';
    const enc = encodeFull(u);
    expect(enc).toBe('https://example.com/path%20with%20space?q=1');
    expect(decodeFull(enc)).toBe(u);
  });

  it('encodePath encodes slashes and query marks', () => {
    expect(encodePath('foo/bar baz')).toBe('foo%2Fbar%20baz');
  });

  it('detects percent encoding', () => {
    expect(isEncoded('hello%20world')).toBe(true);
    expect(isEncoded('hello world')).toBe(false);
  });

  it('isFullyEncoded verifies full encoding', () => {
    expect(isFullyEncoded('hello%20world')).toBe(true);
    expect(isFullyEncoded('hello world')).toBe(false);
    expect(isFullyEncoded('a/b%20c')).toBe(false);
  });

  it('diffEncoded calculates newly encoded characters', () => {
    const before = 'hello world!';
    const after = encodeComponent(before);
    const diff = diffEncoded(before, after);
    expect(diff).toContain(' ');
  });
});
