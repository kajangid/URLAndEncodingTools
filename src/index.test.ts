import { describe, it, expect } from 'vitest';
import * as Root from './index.js';

describe('Root entrypoint exports', () => {
  it('exports all utility namespaces', () => {
    expect(Root.urlParser).toBeDefined();
    expect(Root.queryString).toBeDefined();
    expect(Root.urlValidator).toBeDefined();
    expect(Root.utmBuilder).toBeDefined();
    expect(Root.base64).toBeDefined();
    expect(Root.urlEncoder).toBeDefined();
    expect(Root.htmlEncoder).toBeDefined();
    expect(Root.hex).toBeDefined();
    expect(Root.security).toBeDefined();
  });

  it('exports named functions directly', () => {
    expect(typeof Root.parseUrl).toBe('function');
    expect(typeof Root.parseQuery).toBe('function');
    expect(typeof Root.stringifyQuery).toBe('function');
    expect(typeof Root.validateUrl).toBe('function');
    expect(typeof Root.isValidUrl).toBe('function');
    expect(typeof Root.buildUtm).toBe('function');
    expect(typeof Root.extractUtm).toBe('function');
    expect(typeof Root.escapeHtml).toBe('function');
    expect(typeof Root.unescapeHtml).toBe('function');
    expect(typeof Root.encodeComponent).toBe('function');
    expect(typeof Root.decodeComponent).toBe('function');
    expect(typeof Root.createSafeObject).toBe('function');
  });

  it('can invoke functions through direct exports and namespaces identically', () => {
    const fromNamed = Root.parseUrl('https://example.com/test');
    const fromNamespace = Root.urlParser.parseUrl('https://example.com/test');
    expect(fromNamed.hostname).toBe(fromNamespace.hostname);

    const b64 = Root.base64.encode('hello');
    expect(b64).toBe('aGVsbG8=');

    const hex = Root.hex.encode('hi');
    expect(hex).toBe('6869');
  });
});
