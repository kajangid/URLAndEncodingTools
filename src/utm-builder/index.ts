/**
 * Build marketing campaign URLs by appending UTM parameters to a base URL.
 *
 * Existing UTM keys are replaced (so re-tagging the same link with a new
 * campaign is safe), but unrelated query parameters are preserved.
 */

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

export interface BuildUtmOptions {
  /** Strip existing UTM keys from the URL before appending. Default: `true`. */
  replaceExisting?: boolean;
  /** Additional custom params to merge in. */
  extraParams?: Record<string, string | number | boolean>;
  /** Lowercase all UTM values. Default: `false`. */
  lowercase?: boolean;
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;

function clean(value: string, lowercase: boolean): string {
  const trimmed = value.trim();
  return lowercase ? trimmed.toLowerCase() : trimmed;
}

/**
 * Append UTM parameters to a URL. Returns the original URL when no
 * `source` / `medium` / `campaign` is provided.
 *
 * @example
 * buildUtm('https://example.com/landing', {
 *   source: 'twitter',
 *   medium: 'social',
 *   campaign: 'spring-sale',
 * })
 */
export function buildUtm(baseUrl: string, params: UtmParams, options: BuildUtmOptions = {}): string {
  if (!params.source || !params.medium || !params.campaign) {
    throw new Error('buildUtm: utm_source, utm_medium, and utm_campaign are required');
  }

  const url = new URL(baseUrl);
  const replaceExisting = options.replaceExisting !== false;
  const lowercase = options.lowercase ?? false;

  if (replaceExisting) {
    for (const k of UTM_KEYS) url.searchParams.delete(k);
  }

  // helper: set only if missing (preserves existing when replaceExisting is false)
  const setIfMissing = (k: string, v: string): void => {
    if (replaceExisting) url.searchParams.set(k, v);
    else if (!url.searchParams.has(k)) url.searchParams.set(k, v);
  };

  setIfMissing('utm_source', clean(params.source, lowercase));
  setIfMissing('utm_medium', clean(params.medium, lowercase));
  setIfMissing('utm_campaign', clean(params.campaign, lowercase));
  if (params.term !== undefined) setIfMissing('utm_term', clean(params.term, lowercase));
  if (params.content !== undefined) setIfMissing('utm_content', clean(params.content, lowercase));

  if (options.extraParams) {
    for (const [k, v] of Object.entries(options.extraParams)) {
      url.searchParams.set(k, String(v));
    }
  }

  return url.toString();
}

/**
 * Pull UTM parameters out of a URL. Useful for analytics ingestion.
 * Returns `null` for any field that isn't present.
 */
export function extractUtm(input: string): UtmParams | null {
  const url = new URL(input);
  const source = url.searchParams.get('utm_source');
  const medium = url.searchParams.get('utm_medium');
  const campaign = url.searchParams.get('utm_campaign');
  if (!source || !medium || !campaign) return null;
  return {
    source,
    medium,
    campaign,
    term: url.searchParams.get('utm_term') ?? undefined,
    content: url.searchParams.get('utm_content') ?? undefined,
  };
}

/** True if the URL has all three required UTM parameters. */
export function hasUtm(input: string): boolean {
  return extractUtm(input) !== null;
}
