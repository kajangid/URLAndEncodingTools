/**
 * Minimalist, zero-dependency CLI argument and flag parser.
 */

export interface ParsedArgs {
  command?: string;
  subcommand?: string;
  positionals: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(rawArgs: string[]): ParsedArgs {
  const positionals: string[] = [];
  const flags: Record<string, string | boolean> = Object.create(null);

  let i = 0;
  while (i < rawArgs.length) {
    const arg = rawArgs[i]!;

    if (arg === '--') {
      // Everything after -- is treated as positional arguments
      positionals.push(...rawArgs.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx);
        const val = arg.slice(eqIdx + 1);
        flags[key] = val;
      } else {
        const key = arg.slice(2);
        const next = rawArgs[i + 1];
        if (next && !next.startsWith('-')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      const key = arg.slice(1);
      if (key === 'h' || key === 'v') {
        flags[key] = true;
      } else {
        const next = rawArgs[i + 1];
        if (next && !next.startsWith('-')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else {
      positionals.push(arg);
    }
    i++;
  }

  return {
    positionals,
    flags,
  };
}
