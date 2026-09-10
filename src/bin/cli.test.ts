import { describe, it, expect } from 'vitest';
import { parseArgs, runCli, VERSION } from './cli.js';
import { VERSION as ROOT_VERSION } from '../version.js';

describe('CLI Args Parser', () => {
  it('parses commands, subcommands, and flags', () => {
    const raw = ['base64', 'encode', 'hello', '--url', '--delimiter=;'];
    const parsed = parseArgs(raw);
    expect(parsed.positionals).toEqual(['base64', 'encode', 'hello']);
    expect(parsed.flags['url']).toBe(true);
    expect(parsed.flags['delimiter']).toBe(';');
  });

  it('handles short flags', () => {
    const raw = ['-h', '-v'];
    const parsed = parseArgs(raw);
    expect(parsed.flags['h']).toBe(true);
    expect(parsed.flags['v']).toBe(true);
  });
});

describe('CLI Dispatcher & Exit Codes', () => {
  it('returns version with --version flag (code 0)', async () => {
    const res = await runCli({ positionals: [], flags: { version: true } });
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toBe(VERSION);
  });

  it('returns version with -v short flag (code 0)', async () => {
    const res = await runCli({ positionals: [], flags: { v: true } });
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toBe(VERSION);
  });

  it('ensures cli VERSION matches root version.ts export', () => {
    expect(VERSION).toBe(ROOT_VERSION);
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/);
  });

  it('returns help text with --help flag (code 0)', async () => {
    const res = await runCli({ positionals: [], flags: { help: true } });
    expect(res.exitCode).toBe(0);
    expect(res.stdout).toContain('@omnidev-tools/url-and-encoding CLI Toolkit');
  });

  it('returns error code 2 when no command is provided', async () => {
    const res = await runCli({ positionals: [], flags: {} });
    expect(res.exitCode).toBe(2);
    expect(res.stderr).toContain('No command specified');
  });

  it('returns error code 2 on unknown command', async () => {
    const res = await runCli({ positionals: ['nonexistent'], flags: {} });
    expect(res.exitCode).toBe(2);
    expect(res.stderr).toContain('Unknown command');
  });

  // Tool: base64
  describe('base64 command', () => {
    it('encodes string input to base64', async () => {
      const res = await runCli({ positionals: ['base64', 'encode', 'hello'], flags: {} });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('aGVsbG8=');
    });

    it('encodes with --url flag', async () => {
      const res = await runCli({ positionals: ['base64', 'encode', 'subjects/?+'], flags: { url: true } });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).not.toContain('+');
      expect(res.stdout).not.toContain('/');
    });

    it('decodes valid base64', async () => {
      const res = await runCli({ positionals: ['base64', 'decode', 'aGVsbG8='], flags: {} });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('hello');
    });

    it('checks validity', async () => {
      const validRes = await runCli({ positionals: ['base64', 'check', 'aGVsbG8='], flags: {} });
      expect(validRes.exitCode).toBe(0);
      expect(validRes.stdout).toBe('VALID');

      const invalidRes = await runCli({ positionals: ['base64', 'check', 'not-valid!'], flags: {} });
      expect(invalidRes.exitCode).toBe(1);
      expect(invalidRes.stdout).toBe('INVALID');
    });
  });

  // Tool: hex
  describe('hex command', () => {
    it('encodes string to hex', async () => {
      const res = await runCli({ positionals: ['hex', 'encode', 'Hello'], flags: {} });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('48656c6c6f');
    });

    it('decodes valid hex', async () => {
      const res = await runCli({ positionals: ['hex', 'decode', '48656c6c6f'], flags: {} });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('Hello');
    });

    it('returns error code 1 on odd-length invalid hex', async () => {
      const res = await runCli({ positionals: ['hex', 'decode', 'abc'], flags: {} });
      expect(res.exitCode).toBe(1);
      expect(res.stderr).toContain('Invalid hex input');
    });

    it('formats hex with --bytes-per-line', async () => {
      const res = await runCli({
        positionals: ['hex', 'format', '0001020304050607'],
        flags: { 'bytes-per-line': '4' },
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('00 01 02 03\n04 05 06 07');
    });
  });

  // Tool: url-parser
  describe('url-parser command', () => {
    it('parses url and returns json', async () => {
      const res = await runCli({
        positionals: ['url-parser', 'https://example.com:8080/test?a=1#frag'],
        flags: {},
      });
      expect(res.exitCode).toBe(0);
      const json = JSON.parse(res.stdout!);
      expect(json.hostname).toBe('example.com');
      expect(json.port).toBe('8080');
    });

    it('extracts specific field with --field', async () => {
      const res = await runCli({
        positionals: ['url-parser', 'https://example.com/test'],
        flags: { field: 'pathname' },
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('/test');
    });

    it('returns error code 1 on invalid url', async () => {
      const res = await runCli({
        positionals: ['url-parser', 'invalid url'],
        flags: {},
      });
      expect(res.exitCode).toBe(1);
      expect(res.stderr).toContain('Invalid URL');
    });
  });

  // Tool: url-validator
  describe('url-validator command', () => {
    it('validates a correct url', async () => {
      const res = await runCli({
        positionals: ['url-validator', 'https://example.com/'],
        flags: {},
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('VALID: https://example.com/');
    });

    it('rejects disallowed protocols (code 1)', async () => {
      const res = await runCli({
        positionals: ['url-validator', 'ftp://example.com/'],
        flags: {},
      });
      expect(res.exitCode).toBe(1);
      expect(res.stderr).toContain('DISALLOWED_PROTOCOL');
    });

    it('supports --json flag', async () => {
      const res = await runCli({
        positionals: ['url-validator', 'https://example.com/'],
        flags: { json: true },
      });
      expect(res.exitCode).toBe(0);
      const data = JSON.parse(res.stdout!);
      expect(data.valid).toBe(true);
    });
  });

  // Tool: utm-builder
  describe('utm-builder command', () => {
    it('builds a UTM-tagged URL', async () => {
      const res = await runCli({
        positionals: ['utm-builder', 'https://example.com/landing'],
        flags: {
          source: 'twitter',
          medium: 'social',
          campaign: 'spring-sale',
        },
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toContain('utm_source=twitter');
      expect(res.stdout).toContain('utm_medium=social');
      expect(res.stdout).toContain('utm_campaign=spring-sale');
    });

    it('returns code 2 when required UTM flags are missing', async () => {
      const res = await runCli({
        positionals: ['utm-builder', 'https://example.com/'],
        flags: { source: 'twitter' },
      });
      expect(res.exitCode).toBe(2);
      expect(res.stderr).toContain('--source, --medium, and --campaign flags are required');
    });

    it('extracts UTM parameters with --extract', async () => {
      const res = await runCli({
        positionals: ['utm-builder', 'https://example.com/?utm_source=tw&utm_medium=soc&utm_campaign=sale'],
        flags: { extract: true },
      });
      expect(res.exitCode).toBe(0);
      const data = JSON.parse(res.stdout!);
      expect(data.source).toBe('tw');
    });
  });

  // Tool: query-string
  describe('query-string command', () => {
    it('parses a query string', async () => {
      const res = await runCli({
        positionals: ['query-string', 'parse', 'a=1&b=2'],
        flags: {},
      });
      expect(res.exitCode).toBe(0);
      const data = JSON.parse(res.stdout!);
      expect(data.a).toBe('1');
      expect(data.b).toBe('2');
    });

    it('stringifies a JSON object', async () => {
      const res = await runCli({
        positionals: ['query-string', 'stringify', '{"a":1,"b":"hello"}'],
        flags: {},
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('a=1&b=hello');
    });
  });

  // Tool: html-encoder
  describe('html-encoder command', () => {
    it('escapes html', async () => {
      const res = await runCli({
        positionals: ['html-encoder', 'escape', '<div class="test">'],
        flags: {},
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('&lt;div class=&quot;test&quot;&gt;');
    });

    it('unescapes html', async () => {
      const res = await runCli({
        positionals: ['html-encoder', 'unescape', '&lt;b&gt;bold&lt;/b&gt;'],
        flags: {},
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('<b>bold</b>');
    });

    it('strips html', async () => {
      const res = await runCli({
        positionals: ['html-encoder', 'strip', '<p>hello <b>world</b></p>'],
        flags: {},
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('hello world');
    });
  });

  // Tool: url-encoder
  describe('url-encoder command', () => {
    it('encodes uri component', async () => {
      const res = await runCli({
        positionals: ['url-encoder', 'encode', 'hello world?'],
        flags: {},
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('hello%20world%3F');
    });

    it('decodes uri component', async () => {
      const res = await runCli({
        positionals: ['url-encoder', 'decode', 'hello%20world%3F'],
        flags: {},
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('hello world?');
    });

    it('encodes path with --path', async () => {
      const res = await runCli({
        positionals: ['url-encoder', 'encode', 'foo/bar baz'],
        flags: { path: true },
      });
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('foo%2Fbar%20baz');
    });
  });

  // Aliases support
  describe('Dedicated Binary Aliases routing', () => {
    it('routes alias "b64" directly to base64 tool', async () => {
      const res = await runCli({ positionals: ['encode', 'testing'], flags: {} }, 'base64');
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('dGVzdGluZw==');
    });

    it('routes alias "hex-convert" to hex tool', async () => {
      const res = await runCli({ positionals: ['encode', 'Hi'], flags: {} }, 'hex');
      expect(res.exitCode).toBe(0);
      expect(res.stdout).toBe('4869');
    });
  });
});
