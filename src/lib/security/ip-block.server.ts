/**
 * Bloqueio temporário de IP (em memória, por instância).
 * Usado após detecção de DevTools / abuso — não é proteção forte.
 */

type BanEntry = { until: number; reason: string };

const bans = new Map<string, BanEntry>();
const MAX_BANS = 10_000;

export function banIp(ip: string, durationMs: number, reason: string): void {
  if (!ip || ip === "unknown") return;
  if (bans.size > MAX_BANS) {
    const now = Date.now();
    for (const [k, v] of bans) {
      if (v.until <= now) bans.delete(k);
    }
  }
  const prev = bans.get(ip);
  const until = Date.now() + durationMs;
  // Estende se já banido
  bans.set(ip, {
    until: prev && prev.until > until ? prev.until : until,
    reason,
  });
}

export function isIpBanned(ip: string): { banned: true; retryAfterSec: number; reason: string } | { banned: false } {
  if (!ip || ip === "unknown") return { banned: false };
  const entry = bans.get(ip);
  if (!entry) return { banned: false };
  const now = Date.now();
  if (entry.until <= now) {
    bans.delete(ip);
    return { banned: false };
  }
  return {
    banned: true,
    retryAfterSec: Math.max(1, Math.ceil((entry.until - now) / 1000)),
    reason: entry.reason,
  };
}
