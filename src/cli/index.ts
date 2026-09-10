#!/usr/bin/env node
import * as path from 'node:path';
import { parseArgs } from './args.js';
import { runCli } from './dispatcher.js';

const rawBin = path.basename(process.argv[1] || '');
const binName = rawBin.replace(/\.(c?js|cmd|ps1|sh)$/i, '');

const ALIAS_MAP: Record<string, string> = {
  'url-parse': 'url-parser',
  'query-string': 'query-string',
  'url-validate': 'url-validator',
  'utm-build': 'utm-builder',
  'b64': 'base64',
  'url-encode': 'url-encoder',
  'html-encode': 'html-encoder',
  'hex-convert': 'hex',
};

const defaultCmd = ALIAS_MAP[binName];
const parsed = parseArgs(process.argv.slice(2));

runCli(parsed, defaultCmd)
  .then((result) => {
    if (result.stdout) {
      process.stdout.write(`${result.stdout}\n`);
    }
    if (result.stderr) {
      process.stderr.write(`${result.stderr}\n`);
    }
    process.exit(result.exitCode);
  })
  .catch((err) => {
    process.stderr.write(`Fatal Error: ${(err as Error).message}\n`);
    process.exit(1);
  });
