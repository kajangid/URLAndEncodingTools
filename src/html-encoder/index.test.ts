import { describe, it, expect } from 'vitest';
import { escapeHtml, escapeAttribute, unescapeHtml, stripHtml } from './index.js';

describe('escapeHtml', () => {
  it('escapes all five sensitive characters', () => {
    expect(escapeHtml(`<script>alert("xss & 'hax'")</script>`)).toBe(
      '&lt;script&gt;alert(&quot;xss &amp; &#39;hax&#39;&quot;)&lt;/script&gt;',
    );
  });

  it('returns "" for non-string input', () => {
    expect(escapeHtml(42 as unknown as string)).toBe('');
  });
});

describe('escapeAttribute', () => {
  it('escapes & " < >', () => {
    expect(escapeAttribute(`"hello" & 'world'`)).toBe('&quot;hello&quot; &amp; &#39;world&#39;');
  });
});

describe('unescapeHtml', () => {
  it('reverses the named entities', () => {
    expect(unescapeHtml('&lt;p&gt;hi&lt;/p&gt;')).toBe('<p>hi</p>');
  });

  it('handles decimal numeric entities', () => {
    expect(unescapeHtml('&#65;BC')).toBe('ABC');
  });

  it('handles hex numeric entities', () => {
    expect(unescapeHtml('&#x41;BC')).toBe('ABC');
  });

  it('handles named HTML entities', () => {
    expect(unescapeHtml('&copy; 2024 &mdash; ACME')).toBe('© 2024 — ACME');
  });

  it('replaces unknown named entities with the literal', () => {
    expect(unescapeHtml('&nonexistent;')).toBe('&nonexistent;');
  });

  it('replaces out-of-range numeric entities with replacement char', () => {
    expect(unescapeHtml('&#x110000;')).toBe('\uFFFD');
  });
});

describe('stripHtml', () => {
  it('removes all tags', () => {
    expect(stripHtml('<p>hello <b>world</b></p>')).toBe('hello world');
  });
});
