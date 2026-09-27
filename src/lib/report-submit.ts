import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { isIpBanned } from "./security/ip-block.server.ts";
import {
  checkRateLimit,
  clientIpFromRequest,
} from "./security/rate-limit.server.ts";
import {
  escapeHtml,
  sendTelegramFile,
  sendTelegramMessage,
  type TelegramFileInput,
} from "./telegram.server.ts";

export type ReportAttachment = {
  name: string;
  size: number;
  type: string;
  /** base64 sem prefixo data: */
  base64: string;
};

export type ReportPayload = {
  id: string;
  channel: "delavy" | "hadmage";
  nome: string;
  contato: string | null;
  servidor: string | null;
  acusado: string | null;
  tipo: string;
  relato: string;
  files: { name: string; size: number; type: string }[];
  /** Anexos com conteúdo (máx. 5, ~8 MB cada no cliente) */
  attachments?: ReportAttachment[];
  anon: boolean;
  at: string;
};

export type ReportSubmitResult =
  | { ok: true; id: string; telegram: boolean; filesSent: number; filesFailed: number }
  | { ok: false; id: string; error: string };

const MAX_ATTACHMENTS = 5;
const MAX_BASE64_CHARS = Math.floor(8.5 * 1024 * 1024 * 1.37); // ~8.5 MB binário em base64

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatReportMessage(p: ReportPayload, attachmentCount: number): string {
  const isDelavy = p.channel === "delavy";
  const when = formatWhen(p.at);
  const nome = p.anon ? "Anônimo" : escapeHtml(p.nome);

  const lines: string[] = [
    isDelavy ? "🚨 <b>DENÚNCIA DELAVY</b>" : "📩 <b>MENSAGEM HADMAGE</b>",
    "",
    `<b>Protocolo:</b> ${escapeHtml(p.id)}`,
    `<b>Quando:</b> ${escapeHtml(when)}`,
    `<b>Tipo:</b> ${escapeHtml(p.tipo)}`,
    `<b>Nome:</b> ${nome}`,
    p.contato
      ? `<b>Contato:</b> ${escapeHtml(p.contato)}`
      : "<b>Contato:</b> —",
  ];

  if (p.servidor) {
    lines.push(`<b>Servidor/grupo:</b> ${escapeHtml(p.servidor)}`);
  }
  if (p.acusado) {
    lines.push(`<b>Envolvido(s):</b> ${escapeHtml(p.acusado)}`);
  }

  lines.push("", "<b>Relato:</b>", escapeHtml(p.relato));

  if (attachmentCount > 0) {
    lines.push(
      "",
      `<b>Anexos:</b> ${attachmentCount} arquivo(s) — enviados em seguida nesta conversa.`,
    );
  } else {
    lines.push("", "<b>Anexos:</b> nenhum");
  }

  return lines.join("\n");
}

function sanitizeAttachments(
  list: ReportAttachment[] | undefined,
): TelegramFileInput[] {
  if (!Array.isArray(list)) return [];

  const out: TelegramFileInput[] = [];
  for (const item of list.slice(0, MAX_ATTACHMENTS)) {
    if (!item?.base64 || typeof item.base64 !== "string") continue;
    const base64 = item.base64.replace(/^data:[^;]+;base64,/, "").trim();
    if (!base64 || base64.length > MAX_BASE64_CHARS) continue;

    const filename = String(item.name || "anexo.bin")
      .replace(/[^\w.\-() ]+/g, "_")
      .slice(0, 120);
    const mimeType = String(item.type || "application/octet-stream").slice(0, 120);

    out.push({ filename, mimeType, base64 });
  }
  return out;
}

/** Limites anti-abuso no endpoint de denúncia */
const REPORT_LIMIT_PER_IP = 5;
const REPORT_WINDOW_MS = 15 * 60 * 1000; // 5 envios / 15 min por IP
const REPORT_BURST_LIMIT = 2;
const REPORT_BURST_MS = 60 * 1000; // no máx. 2 por minuto

export const submitReport = createServerFn({ method: "POST" }).handler(
  async (ctx): Promise<ReportSubmitResult> => {
    const payload = ctx.data as ReportPayload;
    const request = getRequest();
    const ip = clientIpFromRequest(request);

    const ban = isIpBanned(ip);
    if (ban.banned) {
      return {
        ok: false,
        id: payload?.id ?? "—",
        error: `IP bloqueado. Tente novamente em ${ban.retryAfterSec}s.`,
      };
    }

    const burst = checkRateLimit(`report:burst:${ip}`, REPORT_BURST_LIMIT, REPORT_BURST_MS);
    if (!burst.allowed) {
      return {
        ok: false,
        id: payload?.id ?? "—",
        error: `Muitas tentativas. Aguarde ${burst.retryAfterSec}s e tente de novo.`,
      };
    }

    const windowed = checkRateLimit(
      `report:win:${ip}`,
      REPORT_LIMIT_PER_IP,
      REPORT_WINDOW_MS,
    );
    if (!windowed.allowed) {
      return {
        ok: false,
        id: payload?.id ?? "—",
        error: `Limite de denúncias atingido. Tente novamente em ${windowed.retryAfterSec}s.`,
      };
    }

    if (!payload?.id || !payload?.tipo || !payload?.relato) {
      return {
        ok: false,
        id: payload?.id ?? "—",
        error: "Dados incompletos.",
      };
    }

    // ID só alfanumérico + hífen (evita injeção no protocolo)
    if (!/^[\w.-]{4,40}$/.test(String(payload.id))) {
      return {
        ok: false,
        id: "—",
        error: "Protocolo inválido.",
      };
    }

    if (String(payload.relato).trim().length < 10) {
      return {
        ok: false,
        id: payload.id,
        error: "Relato muito curto.",
      };
    }

    if (String(payload.relato).length > 8000) {
      return {
        ok: false,
        id: payload.id,
        error: "Relato muito longo.",
      };
    }

    const attachments = sanitizeAttachments(payload.attachments);

    const text = formatReportMessage(
      {
        ...payload,
        files: Array.isArray(payload.files) ? payload.files.slice(0, 8) : [],
        nome: String(payload.nome || "Não informado").slice(0, 200),
        tipo: String(payload.tipo).slice(0, 120),
        relato: String(payload.relato).slice(0, 3500),
        contato: payload.contato ? String(payload.contato).slice(0, 200) : null,
        servidor: payload.servidor ? String(payload.servidor).slice(0, 200) : null,
        acusado: payload.acusado ? String(payload.acusado).slice(0, 200) : null,
      },
      attachments.length,
    );

    const tg = await sendTelegramMessage(text, { parseMode: "HTML" });

    if (!tg.ok) {
      console.error("[report-submit] Telegram:", tg.error);
      return {
        ok: false,
        id: payload.id,
        error: tg.error,
      };
    }

    let filesSent = 0;
    let filesFailed = 0;

    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i]!;
      const caption = `${payload.id}\n${i + 1}/${attachments.length} · ${file.filename}`;
      const sent = await sendTelegramFile(file, {
        caption,
        replyToMessageId: tg.messageId || undefined,
      });
      if (sent.ok) {
        filesSent += 1;
      } else {
        filesFailed += 1;
        console.error("[report-submit] anexo:", file.filename, sent.error);
      }
    }

    return {
      ok: true,
      id: payload.id,
      telegram: true,
      filesSent,
      filesFailed,
    };
  },
);
