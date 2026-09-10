import { describe, it, expect } from 'vitest';
import { buildUtm, extractUtm, hasUtm } from './index.js';

describe('utm-builder', () => {
  it('appends utm params to a URL with no existing query', () => {
    const out = buildUtm('https://example.com/landing', {
      source: 'twitter',
      medium: 'social',
      campaign: 'spring-sale',
    });
    expect(out).toContain('utm_source=twitter');
    expect(out).toContain('utm_medium=social');
    expect(out).toContain('utm_campaign=spring-sale');
  });

  it('preserves unrelated query params', () => {
    const out = buildUtm('https://example.com/?ref=newsletter', {
      source: 'twitter',
      medium: 'social',
      campaign: 'spring',
    });
    expect(out).toContain('ref=newsletter');
  });

  it('replaces existing utm params by default', () => {
    const out = buildUtm('https://example.com/?utm_source=old&utm_medium=old&utm_campaign=old', {
      source: 'new',
      medium: 'social',
      campaign: 'spring',
    });
    expect(out).toContain('utm_source=new');
    expect(out).not.toContain('utm_source=old');
  });

  it('keeps existing utm when replaceExisting is false', () => {
    const out = buildUtm(
      'https://example.com/?utm_source=keep',
      { source: 'new', medium: 'social', campaign: 'spring' },
      { replaceExisting: false },
    );
    expect(out).toContain('utm_source=keep');
  });

  it('throws when required fields are missing', () => {
    expect(() => buildUtm('https://example.com/', { source: 'a', medium: 'b', campaign: '' })).toThrow();
  });

  it('lower-cases values when configured', () => {
    const out = buildUtm(
      'https://example.com/',
      { source: 'Twitter', medium: 'Social', campaign: 'Spring' },
      { lowercase: true },
    );
    expect(out).toContain('utm_source=twitter');
    expect(out).toContain('utm_medium=social');
    expect(out).toContain('utm_campaign=spring');
  });

  it('merges extraParams', () => {
    const out = buildUtm(
      'https://example.com/',
      { source: 'a', medium: 'b', campaign: 'c' },
      { extraParams: { ref: 'partner', gclid: '123' } },
    );
    expect(out).toContain('ref=partner');
    expect(out).toContain('gclid=123');
  });

  it('extractUtm extracts parameters', () => {
    const r = extractUtm('https://example.com/?utm_source=x&utm_medium=y&utm_campaign=z&utm_term=q');
    expect(r).toEqual({ source: 'x', medium: 'y', campaign: 'z', term: 'q', content: undefined });
  });

  it('extractUtm returns null when required parameters are missing', () => {
    expect(extractUtm('https://example.com/?utm_source=x')).toBeNull();
  });

  it('hasUtm checks presence', () => {
    expect(hasUtm('https://example.com/?utm_source=x&utm_medium=y&utm_campaign=z')).toBe(true);
    expect(hasUtm('https://example.com/?utm_source=x')).toBe(false);
  });
});
