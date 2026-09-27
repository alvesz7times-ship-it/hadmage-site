import { env } from "./env.server.ts";

export type TelegramResult =
  | { ok: true; messageId: number }
  | { ok: false; error: string };

function getCredentials(chatIdOverride?: string):
  | { ok: true; token: string; chatId: string }
  | { ok: false; error: string } {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId =
    chatIdOverride ?? env("TELEGRAM_CHAT_ID") ?? env("DELAVY_TELEGRAM_CHAT_ID");

  if (!token) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN não configurado no servidor." };
  }
  if (!chatId) {
    return {
      ok: false,
      error: "TELEGRAM_CHAT_ID (ou DELAVY_TELEGRAM_CHAT_ID) não configurado no servidor.",
    };
  }
  return { ok: true, token, chatId };
}

/**
 * Envia texto para o chat configurado (grupo ou canal).
 * Requer TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID no ambiente do servidor.
 */
export async function sendTelegramMessage(
  text: string,
  options?: {
    parseMode?: "HTML" | "Markdown" | "MarkdownV2";
    chatId?: string;
    replyToMessageId?: number;
  },
): Promise<TelegramResult> {
  const creds = getCredentials(options?.chatId);
  if (!creds.ok) return creds;

  const url = `https://api.telegram.org/bot${creds.token}/sendMessage`;

  try {
    const body: Record<string, unknown> = {
      chat_id: creds.chatId,
      text: text.slice(0, 4096),
      parse_mode: options?.parseMode ?? "HTML",
      disable_web_page_preview: true,
    };
    if (options?.replyToMessageId) {
      body.reply_to_message_id = options.replyToMessageId;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      description?: string;
      result?: { message_id?: number };
    };

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.description || `Telegram HTTP ${res.status}`,
      };
    }

    return { ok: true, messageId: data.result?.message_id ?? 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha de rede ao chamar Telegram";
    return { ok: false, error: message };
  }
}

export type TelegramFileInput = {
  /** Nome do arquivo (ex: print.png) */
  filename: string;
  /** MIME type (ex: image/jpeg) */
  mimeType: string;
  /** Conteúdo em base64 (sem data-URL prefix) */
  base64: string;
};

/**
 * Envia foto ou documento para o chat.
 * Imagens (image/*) usam sendPhoto; demais usam sendDocument.
 */
export async function sendTelegramFile(
  file: TelegramFileInput,
  options?: {
    chatId?: string;
    caption?: string;
    replyToMessageId?: number;
  },
): Promise<TelegramResult> {
  const creds = getCredentials(options?.chatId);
  if (!creds.ok) return creds;

  const isImage = file.mimeType.startsWith("image/");
  const method = isImage ? "sendPhoto" : "sendDocument";
  const field = isImage ? "photo" : "document";
  const url = `https://api.telegram.org/bot${creds.token}/${method}`;

  try {
    const binary = Buffer.from(file.base64, "base64");
    if (binary.byteLength === 0) {
      return { ok: false, error: `Arquivo vazio: ${file.filename}` };
    }
    // Limite prático (~12 MB) — base64 no server fn não deve ser enorme
    if (binary.byteLength > 12 * 1024 * 1024) {
      return {
        ok: false,
        error: `Arquivo muito grande (${file.filename}). Máx. 12 MB.`,
      };
    }

    const blob = new Blob([binary], { type: file.mimeType || "application/octet-stream" });
    const form = new FormData();
    form.append("chat_id", creds.chatId);
    form.append(field, blob, file.filename || (isImage ? "foto.jpg" : "arquivo.bin"));
    if (options?.caption) {
      form.append("caption", options.caption.slice(0, 1024));
    }
    if (options?.replyToMessageId) {
      form.append("reply_to_message_id", String(options.replyToMessageId));
    }

    const res = await fetch(url, { method: "POST", body: form });
    const data = (await res.json()) as {
      ok?: boolean;
      description?: string;
      result?: { message_id?: number };
    };

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.description || `Telegram file HTTP ${res.status}`,
      };
    }

    return { ok: true, messageId: data.result?.message_id ?? 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao enviar arquivo ao Telegram";
    return { ok: false, error: message };
  }
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
