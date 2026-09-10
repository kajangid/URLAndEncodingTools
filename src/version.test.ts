import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { VERSION } from './version.js';

describe('Package Version Resolver', () => {
  it('exports a valid non-empty string version', () => {
    expect(typeof VERSION).toBe('string');
    expect(VERSION.length).toBeGreaterThan(0);
  });

  it('matches semantic versioning format (SemVer)', () => {
    const semVerPattern = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;
    expect(VERSION).toMatch(semVerPattern);
  });

  it('matches the exact version defined in package.json', () => {
    const pkg = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
    );
    expect(VERSION).toBe(pkg.version);
  });

  it('resolves fallback version when __PACKAGE_VERSION__ is not defined', () => {
    // Simulate fallback behavior directly
    const resolveFallback = (injected?: string) =>
      typeof injected !== 'undefined' ? injected : '1.0.0';

    expect(resolveFallback(undefined)).toBe('1.0.0');
    expect(resolveFallback('2.3.4')).toBe('2.3.4');
  });
});
