import { parseUrl } from '../url-parser/index.js';
import { parse as parseQs, stringify as stringifyQs, ArrayFormat } from '../query-string/index.js';
import { validate as validateUrl } from '../url-validator/index.js';
import { buildUtm, extractUtm } from '../utm-builder/index.js';
import {
  encode as b64Encode,
  decode as b64Decode,
  encodeUrl as b64EncodeUrl,
  decodeUrl as b64DecodeUrl,
  isBase64,
  isBase64Url,
} from '../base64/index.js';
import {
  encodeComponent,
  decodeComponent,
  encodeFull,
  decodeFull,
  encodePath,
  encodeComponentKeep,
} from '../url-encoder/index.js';
import {
  escapeHtml,
  escapeAttribute,
  unescapeHtml,
  stripHtml,
} from '../html-encoder/index.js';
import {
  encode as hexEncode,
  decode as hexDecode,
  format as hexFormat,
  isHex,
} from '../hex/index.js';
import { ParsedArgs } from './args.js';
import { resolveInput } from './io.js';

export const VERSION = '0.1.0';

export interface CliResult {
  exitCode: number;
  stdout?: string;
  stderr?: string;
}

export const HELP_TEXT = `
@omnidev-tools/url-and-encoding CLI Toolkit

Usage:
  url-tools <command> [subcommand] [arguments...] [flags]
  omnidev <command> [subcommand] [arguments...] [flags]

Dedicated Binary Aliases:
  url-parse      -> url-parser
  query-string   -> query-string
  url-validate   -> url-validator
  utm-build      -> utm-builder
  b64            -> base64
  url-encode     -> url-encoder
  html-encode    -> html-encoder
  hex-convert    -> hex

Commands:
  url-parser <url>
      --json                  Output structured URL as JSON (default)
      --field <name>          Output specific field (e.g., hostname, port, pathname)

  query-string <parse|stringify> [input]
      --delimiter <char>      Delimiter between pairs (default: &)
      --array-format <format> none|bracket|index|comma (default: none)
      --json                  Output parsed query as formatted JSON

  url-validator <url>
      --reject-localhost      Reject loopback / localhost hostnames
      --protocols <list>      Comma-separated allowed protocols (e.g., http,https)
      --max-length <n>        Maximum URL length allowed (default: 2048)
      --json                  Output full validation result as JSON

  utm-builder <url>
      --source <str>          UTM source (required)
      --medium <str>          UTM medium (required)
      --campaign <str>        UTM campaign (required)
      --term <str>            UTM search keyword
      --content <str>         UTM ad / CTA content
      --lowercase             Lower-case all UTM values
      --extract               Extract UTM parameters from the given URL

  base64 <encode|decode|check> [input]
      --url                   Use URL-safe Base64 alphabet without padding

  url-encoder <encode|decode> [input]
      --full                  Encode/decode full URL using encodeURI
      --path                  Encode path segment
      --keep <chars>          Preserve specific characters without percent-encoding

  html-encoder <escape|unescape|strip> [input]
      --attr                  Escape for HTML attribute context

  hex <encode|decode|format|check> [input]
      --bytes-per-line <n>    Format output grouping bytes (default: 16)

General Flags:
  -h, --help                  Show this help message
  -v, --version               Show version number
`;

export async function runCli(args: ParsedArgs, defaultCommand?: string): Promise<CliResult> {
  const { flags } = args;

  if (flags['help'] || flags['h']) {
    return { exitCode: 0, stdout: HELP_TEXT.trim() };
  }

  if (flags['version'] || flags['v']) {
    return { exitCode: 0, stdout: VERSION };
  }

  let cmd = defaultCommand;
  const positionals = [...args.positionals];

  if (!cmd && positionals.length > 0) {
    cmd = positionals.shift();
  }

  if (!cmd) {
    return {
      exitCode: 2,
      stderr: 'Error: No command specified. Use --help to view available commands.',
    };
  }

  // Normalize command name
  const normalizedCmd = cmd.toLowerCase().replace(/_/g, '-');

  switch (normalizedCmd) {
    case 'url-parser':
    case 'url-parse': {
      const raw = await resolveInput(positionals[0]);
      if (!raw) {
        return { exitCode: 2, stderr: 'Error: url-parser requires a URL input or piped stdin.' };
      }
      try {
        const parsed = parseUrl(raw);
        const field = flags['field'];
        if (typeof field === 'string' && field in parsed) {
          const val = (parsed as unknown as Record<string, unknown>)[field];
          return {
            exitCode: 0,
            stdout: typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val ?? ''),
          };
        }
        return { exitCode: 0, stdout: JSON.stringify(parsed, null, 2) };
      } catch (err) {
        return { exitCode: 1, stderr: `Error: Invalid URL - ${(err as Error).message}` };
      }
    }

    case 'query-string': {
      let sub = positionals[0];
      let inputArg = positionals[1];
      if (sub !== 'parse' && sub !== 'stringify') {
        inputArg = sub;
        sub = 'parse'; // default subcommand
      }
      const raw = await resolveInput(inputArg);
      const delimiter = typeof flags['delimiter'] === 'string' ? flags['delimiter'] : undefined;

      if (sub === 'parse') {
        const res = parseQs(raw, { delimiter });
        return { exitCode: 0, stdout: JSON.stringify(res, null, 2) };
      } else {
        // stringify
        try {
          const parsedJson = JSON.parse(raw);
          const arrayFormat = (flags['array-format'] as ArrayFormat) || 'none';
          const out = stringifyQs(parsedJson, { delimiter, arrayFormat });
          return { exitCode: 0, stdout: out };
        } catch {
          return {
            exitCode: 2,
            stderr: 'Error: query-string stringify requires valid JSON input representing an object.',
          };
        }
      }
    }

    case 'url-validator':
    case 'url-validate': {
      const raw = await resolveInput(positionals[0]);
      if (!raw) {
        return { exitCode: 2, stderr: 'Error: url-validator requires a URL input or piped stdin.' };
      }
      const rejectLocalhost = Boolean(flags['reject-localhost']);
      const protocols = typeof flags['protocols'] === 'string'
        ? flags['protocols'].split(',').map((p) => p.trim())
        : undefined;
      const maxLength = typeof flags['max-length'] === 'string'
        ? parseInt(flags['max-length'], 10)
        : undefined;

      const res = validateUrl(raw, { rejectLocalhost, protocols, maxLength });

      if (flags['json']) {
        return {
          exitCode: res.valid ? 0 : 1,
          stdout: JSON.stringify(res.valid ? { valid: true, href: res.url.href } : res, null, 2),
        };
      }

      if (res.valid) {
        return { exitCode: 0, stdout: `VALID: ${res.url.href}` };
      } else {
        return { exitCode: 1, stderr: `INVALID [${res.error.code}]: ${res.error.message}` };
      }
    }

    case 'utm-builder':
    case 'utm-build': {
      const raw = await resolveInput(positionals[0]);
      if (!raw) {
        return { exitCode: 2, stderr: 'Error: utm-builder requires a base URL input.' };
      }

      if (flags['extract']) {
        const extracted = extractUtm(raw);
        if (!extracted) {
          return { exitCode: 1, stderr: 'No UTM parameters found in URL.' };
        }
        return { exitCode: 0, stdout: JSON.stringify(extracted, null, 2) };
      }

      const source = flags['source'];
      const medium = flags['medium'];
      const campaign = flags['campaign'];
      const term = flags['term'];
      const content = flags['content'];
      const lowercase = Boolean(flags['lowercase']);

      if (!source || !medium || !campaign || typeof source !== 'string' || typeof medium !== 'string' || typeof campaign !== 'string') {
        return {
          exitCode: 2,
          stderr: 'Error: --source, --medium, and --campaign flags are required to build UTM URL.',
        };
      }

      try {
        const tagged = buildUtm(
          raw,
          {
            source,
            medium,
            campaign,
            term: typeof term === 'string' ? term : undefined,
            content: typeof content === 'string' ? content : undefined,
          },
          { lowercase },
        );
        return { exitCode: 0, stdout: tagged };
      } catch (err) {
        return { exitCode: 1, stderr: `Error: ${(err as Error).message}` };
      }
    }

    case 'base64':
    case 'b64': {
      let sub = positionals[0];
      let inputArg = positionals[1];
      if (sub !== 'encode' && sub !== 'decode' && sub !== 'check') {
        inputArg = sub;
        sub = 'encode'; // default
      }
      const raw = await resolveInput(inputArg);
      const isUrlSafe = Boolean(flags['url']);

      if (sub === 'encode') {
        return { exitCode: 0, stdout: isUrlSafe ? b64EncodeUrl(raw) : b64Encode(raw) };
      } else if (sub === 'decode') {
        try {
          const out = isUrlSafe ? b64DecodeUrl(raw) : b64Decode(raw);
          return { exitCode: 0, stdout: out };
        } catch (err) {
          return { exitCode: 1, stderr: `Error: Invalid Base64 payload - ${(err as Error).message}` };
        }
      } else if (sub === 'check') {
        const valid = isUrlSafe ? isBase64Url(raw) : isBase64(raw);
        return {
          exitCode: valid ? 0 : 1,
          stdout: valid ? 'VALID' : 'INVALID',
        };
      }
      return { exitCode: 2, stderr: `Unknown base64 action "${sub}"` };
    }

    case 'url-encoder':
    case 'url-encode': {
      let sub = positionals[0];
      let inputArg = positionals[1];
      if (sub !== 'encode' && sub !== 'decode') {
        inputArg = sub;
        sub = 'encode';
      }
      const raw = await resolveInput(inputArg);

      if (sub === 'encode') {
        if (flags['full']) {
          return { exitCode: 0, stdout: encodeFull(raw) };
        }
        if (flags['path']) {
          return { exitCode: 0, stdout: encodePath(raw) };
        }
        if (typeof flags['keep'] === 'string') {
          return { exitCode: 0, stdout: encodeComponentKeep(raw, { keep: flags['keep'] }) };
        }
        return { exitCode: 0, stdout: encodeComponent(raw) };
      } else {
        // decode
        try {
          const out = flags['full'] ? decodeFull(raw) : decodeComponent(raw);
          return { exitCode: 0, stdout: out };
        } catch (err) {
          return { exitCode: 1, stderr: `Error: URI decode failed - ${(err as Error).message}` };
        }
      }
    }

    case 'html-encoder':
    case 'html-encode': {
      let sub = positionals[0];
      let inputArg = positionals[1];
      if (sub !== 'escape' && sub !== 'unescape' && sub !== 'strip') {
        inputArg = sub;
        sub = 'escape';
      }
      const raw = await resolveInput(inputArg);

      if (sub === 'escape') {
        return { exitCode: 0, stdout: flags['attr'] ? escapeAttribute(raw) : escapeHtml(raw) };
      } else if (sub === 'unescape') {
        return { exitCode: 0, stdout: unescapeHtml(raw) };
      } else if (sub === 'strip') {
        return { exitCode: 0, stdout: stripHtml(raw) };
      }
      return { exitCode: 2, stderr: `Unknown html-encoder action "${sub}"` };
    }

    case 'hex':
    case 'hex-convert': {
      let sub = positionals[0];
      let inputArg = positionals[1];
      if (sub !== 'encode' && sub !== 'decode' && sub !== 'format' && sub !== 'check') {
        inputArg = sub;
        sub = 'encode';
      }
      const raw = await resolveInput(inputArg);

      if (sub === 'encode') {
        return { exitCode: 0, stdout: hexEncode(raw) };
      } else if (sub === 'decode') {
        try {
          return { exitCode: 0, stdout: hexDecode(raw) };
        } catch (err) {
          return { exitCode: 1, stderr: `Error: Invalid hex input - ${(err as Error).message}` };
        }
      } else if (sub === 'check') {
        const valid = isHex(raw);
        return {
          exitCode: valid ? 0 : 1,
          stdout: valid ? 'VALID' : 'INVALID',
        };
      } else if (sub === 'format') {
        const bytesPerLine = typeof flags['bytes-per-line'] === 'string'
          ? parseInt(flags['bytes-per-line'], 10)
          : 16;
        return { exitCode: 0, stdout: hexFormat(raw, bytesPerLine) };
      }
      return { exitCode: 2, stderr: `Unknown hex action "${sub}"` };
    }

    default:
      return {
        exitCode: 2,
        stderr: `Error: Unknown command "${cmd}". Run with --help to see available commands.`,
      };
  }
}
