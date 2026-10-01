import { describe, it, expect } from 'vitest';
import { extractUrls, hasUrls } from './index.js';

describe('url-extract', () => {
  it('extracts standard http and https URLs from text', () => {
    const text = 'Check out https://example.com/docs and http://test.org/api?v=1 for details.';
    const urls = extractUrls(text);
    expect(urls).toEqual([
      'https://example.com/docs',
      'http://test.org/api?v=1',
    ]);
  });

  it('strips trailing punctuation like periods, commas, colons, and exclamations', () => {
    const text = 'Visit https://google.com. Also see https://bing.com, or https://duckduckgo.com!';
    const urls = extractUrls(text);
    expect(urls).toEqual([
      'https://google.com',
      'https://bing.com',
      'https://duckduckgo.com',
    ]);
  });

  it('handles balanced parentheses in URLs correctly', () => {
    const text = 'Article: https://en.wikipedia.org/wiki/URL_(disambiguation). (Or see https://example.com/page).';
    const urls = extractUrls(text);
    expect(urls).toEqual([
      'https://en.wikipedia.org/wiki/URL_(disambiguation)',
      'https://example.com/page',
    ]);
  });

  it('handles www.* URLs with auto-prefixing', () => {
    const text = 'Find more at www.github.com/trending.';
    const urls = extractUrls(text);
    expect(urls).toEqual(['https://www.github.com/trending']);
  });

  it('disables www.* URLs when allowWww is false', () => {
    const text = 'Find more at www.github.com and https://example.com.';
    const urls = extractUrls(text, { allowWww: false });
    expect(urls).toEqual(['https://example.com']);
  });

  it('filters by specified protocols', () => {
    const text = 'Files: ftp://files.example.com/a.zip and https://example.com/b.zip';
    const ftpOnly = extractUrls(text, { protocols: ['ftp'] });
    expect(ftpOnly).toEqual(['ftp://files.example.com/a.zip']);
  });

  it('deduplicates URLs by default and retains all when unique is false', () => {
    const text = 'https://example.com and https://example.com';
    expect(extractUrls(text)).toEqual(['https://example.com']);
    expect(extractUrls(text, { unique: false })).toEqual([
      'https://example.com',
      'https://example.com',
    ]);
  });

  it('normalizes URLs via WHATWG URL when normalize is true', () => {
    const text = 'Visit HTTP://EXAMPLE.COM:80/path';
    const urls = extractUrls(text, { normalize: true });
    expect(urls).toEqual(['http://example.com/path']);
  });

  it('returns empty array when input is empty or contains no URLs', () => {
    expect(extractUrls('')).toEqual([]);
    expect(extractUrls('no urls here whatsoever')).toEqual([]);
    expect(extractUrls(null as unknown as string)).toEqual([]);
  });

  it('hasUrls checks existence accurately', () => {
    expect(hasUrls('Check https://example.com')).toBe(true);
    expect(hasUrls('No links here')).toBe(false);
  });
});
