/**
 * URL validation with detailed error reporting.
 *
 * Wraps the WHATWG `URL` constructor and adds protocol whitelists,
 * host format checks, optional IP-only / localhost-only modes, and
 * structured error codes.
 */

export type UrlValidationCode =
  | 'EMPTY'
  | 'NOT_A_STRING'
  | 'TOO_LONG'
  | 'INVALID_URL'
  | 'DISALLOWED_PROTOCOL'
  | 'MISSING_HOST'
  | 'INVALID_HOST'
  | 'INVALID_PORT'
  | 'INVALID_USERINFO';

export interface UrlValidationError {
  code: UrlValidationCode;
  message: string;
}

export type UrlValidationResult =
  | { valid: true; url: URL }
  | { valid: false; error: UrlValidationError };

export interface ValidateOptions {
  /** Allowed protocols (lowercase, without `:`). Default: `['http', 'https']`. */
  protocols?: string[];
  /** Require a non-empty host. Default: `true`. */
  requireHost?: boolean;
  /** Reject localhost / loopback hosts. Default: `false`. */
  rejectLocalhost?: boolean;
  /** Maximum total URL length in characters. Default: `2048`. */
  maxLength?: number;
  /** Restrict to a set of allowed hostnames (case-insensitive). */
  allowedHosts?: string[];
  /** Allow only IPv4 / IPv6 hosts (rejects DNS names). Default: `false`. */
  ipOnly?: boolean;
}

const DEFAULT_PROTOCOLS = ['http', 'https'];
const DEFAULT_MAX_LENGTH = 2048;

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^\[[0-9a-fA-F:]+\]$/;

function fail(code: UrlValidationCode, message: string): UrlValidationResult {
  return { valid: false, error: { code, message } };
}

/**
 * Validate a URL string. Returns a discriminated union — never throws.
 */
export function validate(input: unknown, options: ValidateOptions = {}): UrlValidationResult {
  if (typeof input !== 'string') {
    return fail('NOT_A_STRING', `Expected a string, got ${typeof input}`);
  }
  if (input.length === 0) {
    return fail('EMPTY', 'URL is empty');
  }
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;
  if (input.length > maxLength) {
    return fail('TOO_LONG', `URL exceeds ${maxLength} characters (got ${input.length})`);
  }

  // Pre-validate a port (if present) so we can return a precise error code
  // even when the underlying URL constructor rejects the URL.
  const portMatch = /^https?:\/\/[^/?#]*:(\d+)(?:[/?#]|$)/i.exec(input);
  if (portMatch) {
    const port = portMatch[1] as string;
    if (!isValidPort(port)) {
      return fail('INVALID_PORT', `Port "${port}" is out of range (1-65535)`);
    }
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return fail('INVALID_URL', 'Input is not a valid absolute URL');
  }

  const protocols = (options.protocols ?? DEFAULT_PROTOCOLS).map((p) => p.toLowerCase());
  const proto = url.protocol.replace(/:$/, '').toLowerCase();
  if (!protocols.includes(proto)) {
    return fail(
      'DISALLOWED_PROTOCOL',
      `Protocol "${proto}" is not allowed. Allowed: ${protocols.join(', ')}`,
    );
  }

  if (options.requireHost !== false && !url.hostname) {
    return fail('MISSING_HOST', 'URL is missing a hostname');
  }

  if (options.rejectLocalhost && isLocalhost(url.hostname)) {
    return fail('INVALID_HOST', `Localhost hostnames are not allowed: ${url.hostname}`);
  }

  if (IPV6_RE.test(url.hostname) || IPV4_RE.test(url.hostname)) {
    if (!isValidIp(url.hostname)) {
      return fail('INVALID_HOST', `Host is not a valid IP address: ${url.hostname}`);
    }
  } else {
    if (options.ipOnly) {
      return fail('INVALID_HOST', `Expected an IP host, got hostname: ${url.hostname}`);
    }
    if (!isValidHostname(url.hostname)) {
      return fail('INVALID_HOST', `Host is not a valid DNS name: ${url.hostname}`);
    }
  }

  if (url.port && !isValidPort(url.port)) {
    return fail('INVALID_PORT', `Port "${url.port}" is out of range (1-65535)`);
  }

  if (options.allowedHosts && options.allowedHosts.length > 0) {
    const lower = url.hostname.toLowerCase();
    const allowed = options.allowedHosts.map((h) => h.toLowerCase());
    if (!allowed.includes(lower)) {
      return fail('INVALID_HOST', `Host "${url.hostname}" is not in the allow-list`);
    }
  }

  if (url.username && !/^[A-Za-z0-9\-._~!$&'()*+,;=%:]*$/.test(url.username)) {
    return fail('INVALID_USERINFO', 'Username contains illegal characters');
  }

  return { valid: true, url };
}

/** Convenience boolean predicate. */
export function isValidUrl(input: unknown, options?: ValidateOptions): boolean {
  return validate(input, options).valid;
}

function isLocalhost(host: string): boolean {
  const h = host.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1';
}

function isValidIp(host: string): boolean {
  if (IPV6_RE.test(host)) {
    const inner = host.slice(1, -1);
    // Heuristic — full validation is delegated to URL constructor.
    return inner.length > 0 && /^[0-9a-fA-F:]+$/.test(inner);
  }
  if (IPV4_RE.test(host)) {
    return host.split('.').every((octet) => {
      const n = Number(octet);
      return octet !== '' && octet.length <= 3 && n >= 0 && n <= 255 && String(n) === octet;
    });
  }
  return false;
}

const HOSTNAME_RE = /^(?=.{1,253}$)(?!-)([A-Za-z0-9-]{1,63}(?<!-)\.)*[A-Za-z0-9-]{1,63}(?<!-)$/;

function isValidHostname(host: string): boolean {
  if (host.length === 0 || host.length > 253) return false;
  if (HOSTNAME_RE.test(host)) return true;
  return false;
}

function isValidPort(port: string): boolean {
  if (!/^\d+$/.test(port)) return false;
  const n = Number(port);
  return n >= 1 && n <= 65535;
}
