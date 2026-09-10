import { describe, it, expect } from 'vitest';
import { validate, isValidUrl } from './index.js';

describe('url-validator', () => {
  it('accepts a plain https URL', () => {
    const r = validate('https://example.com/');
    expect(r.valid).toBe(true);
  });

  it('rejects empty string', () => {
    const r = validate('');
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error.code).toBe('EMPTY');
  });

  it('rejects non-string input', () => {
    const r = validate(42);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error.code).toBe('NOT_A_STRING');
  });

  it('rejects a URL over the max length', () => {
    const r = validate('https://example.com/' + 'a'.repeat(3000), { maxLength: 100 });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error.code).toBe('TOO_LONG');
  });

  it('rejects an unparseable URL', () => {
    const r = validate('not a url');
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error.code).toBe('INVALID_URL');
  });

  it('rejects disallowed protocols', () => {
    const r = validate('ftp://example.com/');
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error.code).toBe('DISALLOWED_PROTOCOL');
  });

  it('accepts custom protocols', () => {
    const r = validate('ftp://example.com/', { protocols: ['ftp', 'http', 'https'] });
    expect(r.valid).toBe(true);
  });

  it('rejects localhost when configured', () => {
    const r = validate('http://localhost:3000/', { rejectLocalhost: true });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error.code).toBe('INVALID_HOST');
  });

  it('rejects hosts not in allow-list', () => {
    const r = validate('https://evil.com/', { allowedHosts: ['example.com'] });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error.code).toBe('INVALID_HOST');
  });

  it('rejects non-IP host when ipOnly is set', () => {
    const r = validate('https://example.com/', { ipOnly: true });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error.code).toBe('INVALID_HOST');
  });

  it('accepts IPv4 host when ipOnly is set', () => {
    const r = validate('https://192.168.1.1/', { ipOnly: true });
    expect(r.valid).toBe(true);
  });

  it('rejects invalid port', () => {
    const r = validate('https://example.com:99999/');
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.error.code).toBe('INVALID_PORT');
  });

  it('isValidUrl returns boolean correctly', () => {
    expect(isValidUrl('https://example.com/')).toBe(true);
    expect(isValidUrl('garbage')).toBe(false);
  });
});
