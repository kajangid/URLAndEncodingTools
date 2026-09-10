import { describe, it, expect } from 'vitest';
import { escapeHtml, escapeAttribute, unescapeHtml, stripHtml } from './index.js';

describe('html-encoder', () => {
  it('escapes sensitive characters', () => {
    expect(escapeHtml(`<script>alert("xss & 'hax'")</script>`)).toBe(
      '&lt;script&gt;alert(&quot;xss &amp; &#39;hax&#39;&quot;)&lt;/script&gt;',
    );
  });

  it('returns empty string for non-string input', () => {
    expect(escapeHtml(42 as unknown as string)).toBe('');
  });

  it('escapeAttribute escapes attribute characters', () => {
    expect(escapeAttribute(`"hello" & 'world'`)).toBe('&quot;hello&quot; &amp; &#39;world&#39;');
  });

  it('unescapeHtml reverses entities', () => {
    expect(unescapeHtml('&lt;p&gt;hi&lt;/p&gt;')).toBe('<p>hi</p>');
    expect(unescapeHtml('&#65;BC')).toBe('ABC');
    expect(unescapeHtml('&#x41;BC')).toBe('ABC');
    expect(unescapeHtml('&copy; 2024 &mdash; ACME')).toBe('© 2024 — ACME');
    expect(unescapeHtml('&nonexistent;')).toBe('&nonexistent;');
    expect(unescapeHtml('&#x110000;')).toBe('\uFFFD');
  });

  it('stripHtml removes tags', () => {
    expect(stripHtml('<p>hello <b>world</b></p>')).toBe('hello world');
  });
});
