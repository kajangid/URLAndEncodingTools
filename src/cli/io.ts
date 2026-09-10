import * as fs from 'node:fs';

/**
 * Reads all content from process.stdin asynchronously with an optional timeout.
 */
export async function readStdin(timeoutMs = 1500): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    let timer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      process.stdin.removeListener('data', onData);
      process.stdin.removeListener('end', onEnd);
      process.stdin.removeListener('error', onError);
    };

    const onData = (chunk: string | Buffer) => {
      data += chunk.toString();
    };

    const onEnd = () => {
      cleanup();
      resolve(data);
    };

    const onError = () => {
      cleanup();
      resolve(data);
    };

    timer = setTimeout(() => {
      cleanup();
      resolve(data);
    }, timeoutMs);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', onData);
    process.stdin.on('end', onEnd);
    process.stdin.on('error', onError);

    if (process.stdin.readableEnded) {
      cleanup();
      resolve(data);
    }
  });
}

/**
 * Resolves input from either:
 * 1. The positional argument string (or file path if it points to an existing file)
 * 2. Standard input (if no positional argument is provided and stdin is piped)
 */
export async function resolveInput(positionalArg?: string): Promise<string> {
  if (positionalArg !== undefined && positionalArg !== '') {
    try {
      if (fs.existsSync(positionalArg)) {
        const stat = fs.statSync(positionalArg);
        if (stat.isFile()) {
          return fs.readFileSync(positionalArg, 'utf8');
        }
      }
    } catch {
      // Fallback to using positional argument directly
    }
    return positionalArg;
  }

  // Only attempt reading stdin if no positional argument was provided
  if (!process.stdin.isTTY && !process.env.VITEST) {
    const stdinContent = await readStdin();
    if (stdinContent.length > 0) {
      return stdinContent.replace(/\r?\n$/, '');
    }
  }

  return '';
}
