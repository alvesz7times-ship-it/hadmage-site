/**
 * Headers de segurança em todas as respostas (Nitro / deploy).
 * Complementa rate-limit na API — não mitiga DDoS de rede sozinho.
 *
 * Ordem: Nitro carrega middlewares de server/middleware/* automaticamente.
 */

type Next = () => Promise<unknown> | unknown;

interface SecurityEvent {
  node?: { res?: { setHeader?: (k: string, v: string) => void } };
  res?: { setHeader?: (k: string, v: string) => void };
}

function setHeader(event: SecurityEvent, name: string, value: string) {
  try {
    event.node?.res?.setHeader?.(name, value);
  } catch {
    /* ignore */
  }
  try {
    event.res?.setHeader?.(name, value);
  } catch {
    /* ignore */
  }
}

export default async function securityHeadersMiddleware(
  event: SecurityEvent,
  next: Next,
) {
  setHeader(event, "X-Content-Type-Options", "nosniff");
  setHeader(event, "X-Frame-Options", "DENY");
  setHeader(event, "Referrer-Policy", "strict-origin-when-cross-origin");
  setHeader(event, "X-XSS-Protection", "0");
  setHeader(
    event,
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  setHeader(
    event,
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  );
  setHeader(
    event,
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  return next();
}
