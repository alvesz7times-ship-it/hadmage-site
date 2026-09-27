/**
 * Rate limit em memória (por instância do servidor).
 * Ajuda contra abuso de formulários e flood de API — não substitui
 * proteção de borda (Cloudflare / WAF) contra DDoS volumétrico.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Limpa entradas expiradas periodicamente para não crescer sem limite. */
const MAX_KEYS = 20_000;

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: number }
  | { allowed: false; remaining: 0; resetAt: number; retryAfterSec: number };

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_KEYS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
    // Se ainda grande, remove as mais antigas
    if (buckets.size > MAX_KEYS) {
      const overflow = buckets.size - Math.floor(MAX_KEYS * 0.8);
      let i = 0;
      for (const k of buckets.keys()) {
        buckets.delete(k);
        if (++i >= overflow) break;
      }
    }
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSec,
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Extrai IP do request (considera proxy comum). */
export function clientIpFromRequest(request: Request | null | undefined): string {
  if (!request) return "unknown";
  const headers = request.headers;
  const xf = headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, 64);
  return "unknown";
}
