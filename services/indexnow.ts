/**
 * IndexNow service
 * ----------------
 * Reusable helper for submitting URLs to IndexNow so search engines
 * (Bing, Yandex, Seznam, Naver, and partners) re-crawl updated pages fast.
 *
 * SECURITY: The IndexNow key is a SECRET and must never be shipped to the
 * browser. This module is server-side only (Netlify Functions / Node). It
 * reads configuration from environment variables and delegates the actual
 * network call to the existing Netlify function so the key stays server-side.
 *
 * Env (see .env.example):
 *   INDEXNOW_KEY           - the IndexNow key (secret)
 *   INDEXNOW_KEY_LOCATION  - public URL of the key verification file
 *   INDEXNOW_ENDPOINT      - IndexNow submission endpoint
 *   SITE_URL               - canonical site origin
 */

export interface IndexNowConfig {
  key: string;
  keyLocation: string;
  endpoint: string;
  host: string;
}

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: string[];
  skipped: string[];
  message?: string;
}

const DEFAULT_ENDPOINT = 'https://api.indexnow.org/IndexNow';
const DEFAULT_SITE = 'https://artistsinmycity.com';

/** Read IndexNow config from the environment (server-side only). */
export function getConfig(): IndexNowConfig {
  const env = (typeof process !== 'undefined' && process.env) ? process.env : ({} as Record<string, string>);
  const site = env.SITE_URL || DEFAULT_SITE;
  return {
    key: env.INDEXNOW_KEY || '',
    keyLocation: env.INDEXNOW_KEY_LOCATION || site + '/' + (env.INDEXNOW_KEY || '') + '.txt',
    endpoint: env.INDEXNOW_ENDPOINT || DEFAULT_ENDPOINT,
    host: new URL(site).host,
  };
}

/** Only allow absolute URLs on our own host to be submitted. */
function sanitize(urls: string[], host: string): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const u of urls) {
    try {
      const parsed = new URL(u);
      if (parsed.host === host) { valid.push(parsed.toString()); }
      else { invalid.push(u); }
    } catch {
      invalid.push(u);
    }
  }
  return { valid, invalid };
}

/**
 * Submit a batch of URLs to IndexNow.
 * Returns a structured result; never throws so callers can fire-and-forget.
 */
export async function submitUrls(urls: string[]): Promise<IndexNowResult> {
  const cfg = getConfig();
  const { valid, invalid } = sanitize(urls || [], cfg.host);

  if (!cfg.key) {
    return { ok: false, status: 0, submitted: [], skipped: valid, message: 'INDEXNOW_KEY not configured; submission skipped.' };
  }
  if (valid.length === 0) {
    return { ok: false, status: 0, submitted: [], skipped: invalid, message: 'No valid same-host URLs to submit.' };
  }

  const body = {
    host: cfg.host,
    key: cfg.key,
    keyLocation: cfg.keyLocation,
    urlList: valid,
  };

  try {
    const res = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    return {
      ok: res.ok,
      status: res.status,
      submitted: res.ok ? valid : [],
      skipped: res.ok ? invalid : valid.concat(invalid),
      message: res.ok ? 'Submitted to IndexNow.' : 'IndexNow endpoint returned an error.',
    };
  } catch (err) {
    return { ok: false, status: 0, submitted: [], skipped: valid.concat(invalid), message: 'Network error contacting IndexNow: ' + String(err) };
  }
}

/** Convenience wrapper for a single URL. */
export async function submitUrl(url: string): Promise<IndexNowResult> {
  return submitUrls([url]);
}

/* ------------------------------------------------------------------ *
 * PLACEHOLDER PUBLISH HOOKS (Part 5)
 * ------------------------------------------------------------------
 * These are the integration points for future publish actions. They are
 * intentionally NOT auto-firing yet. When the backend is connected, each
 * hook simply calls submitUrl()/submitUrls(). Until then they no-op and
 * log so wiring can be verified without spamming IndexNow.
 * ------------------------------------------------------------------ */

const HOOKS_ENABLED = false; // flip to true once the publish backend is live

async function fire(label: string, urls: string[]): Promise<IndexNowResult | null> {
  if (!HOOKS_ENABLED) {
    // eslint-disable-next-line no-console
    console.info('[IndexNow hook: ' + label + '] pending backend; would submit', urls);
    return null;
  }
  return submitUrls(urls);
}

export const hooks = {
  artistPublished:   (url: string)   => fire('artist_published', [url]),
  artistProfileUpdated: (url: string) => fire('artist_profile_updated', [url]),
  cityPageUpdated:   (url: string)   => fire('city_page_updated', [url]),
  galleryUpdated:    (url: string)   => fire('gallery_updated', [url]),
  eventCreated:      (url: string)   => fire('event_created', [url]),
  eventUpdated:      (url: string)   => fire('event_updated', [url]),
  sitemapGenerated:  (urls: string[]) => fire('sitemap_generated', urls),
};

export default { submitUrl, submitUrls, getConfig, hooks };
