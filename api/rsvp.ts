import { ADDRESS_MAX_LENGTH, invitationConfig } from "../src/config/invitation.js";
import { formatNumericDate } from "../src/lib/date.js";

/**
 * POST /api/rsvp — принимает адрес и отправляет сообщение в Telegram.
 *
 * Безопасность:
 *  - токен и chat id берутся только из переменных окружения сервера;
 *  - адрес не логируется и нигде не сохраняется;
 *  - сообщение отправляется без parse_mode, поэтому пользовательский ввод
 *    не может повлиять на разметку;
 *  - ограничение частоты запросов (по IP и общее) в памяти инстанса.
 */

type ErrorCode =
  | "method_not_allowed"
  | "unsupported_media_type"
  | "forbidden"
  | "payload_too_large"
  | "invalid_json"
  | "invalid_address"
  | "rate_limited"
  | "not_configured"
  | "telegram_failed";

const MAX_BODY_BYTES = 4 * 1024;
const TELEGRAM_TIMEOUT_MS = 8000;

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_PER_IP = 5;
const RATE_LIMIT_GLOBAL = 30;

const hitsByIp = new Map<string, number[]>();
let globalHits: number[] = [];

function json(status: number, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

function fail(status: number, error: ErrorCode, headers?: Record<string, string>) {
  return json(status, { ok: false, error }, headers);
}

function getClientIp(request: Request): string {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

/** Возвращает количество секунд до сброса лимита или 0, если запрос разрешён. */
function checkRateLimit(ip: string, now: number): number {
  const windowStart = now - RATE_WINDOW_MS;

  globalHits = globalHits.filter((t) => t > windowStart);
  const ipHits = (hitsByIp.get(ip) ?? []).filter((t) => t > windowStart);

  // Периодически чистим устаревшие записи, чтобы Map не рос бесконечно.
  if (hitsByIp.size > 1000) {
    for (const [key, hits] of hitsByIp) {
      if (!hits.some((t) => t > windowStart)) hitsByIp.delete(key);
    }
  }

  if (ipHits.length >= RATE_LIMIT_PER_IP || globalHits.length >= RATE_LIMIT_GLOBAL) {
    const oldest = Math.min(ipHits[0] ?? now, globalHits[0] ?? now);
    hitsByIp.set(ip, ipHits);
    return Math.max(1, Math.ceil((oldest + RATE_WINDOW_MS - now) / 1000));
  }

  ipHits.push(now);
  globalHits.push(now);
  hitsByIp.set(ip, ipHits);
  return 0;
}

/**
 * Приводит адрес к безопасному виду: убирает управляющие и невидимые
 * символы (в том числе символы смены направления текста), схлопывает пробелы.
 */
export function sanitizeAddress(input: unknown): string | null {
  if (typeof input !== "string") return null;

  const cleaned = input
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/[​-‏‪-‮⁠-⁩﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length === 0) return null;
  if (Array.from(cleaned).length > ADDRESS_MAX_LENGTH) return null;
  return cleaned;
}

export function buildMessage(address: string): string {
  return [
    "💌 Ответ на приглашение",
    "",
    `${invitationConfig.recipientName} согласилась на свидание.`,
    "",
    `📅 ${formatNumericDate(invitationConfig.date)}`,
    `🕢 ${invitationConfig.time}`,
    `📍 Адрес: ${address}`,
  ].join("\n");
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // не браузерный запрос или старый браузер — проверяем остальным
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function sendToTelegram(token: string, chatId: string, text: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        link_preview_options: { is_disabled: true },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Логируем код и пояснение Telegram (например, «chat not found») — без текста сообщения и адреса.
      const details = (await response.json().catch(() => null)) as { description?: unknown } | null;
      const description = typeof details?.description === "string" ? `: ${details.description.slice(0, 200)}` : "";
      console.error(`[rsvp] Telegram API responded with status ${response.status}${description}`);
      return false;
    }

    const data = (await response.json().catch(() => null)) as { ok?: unknown } | null;
    if (data?.ok !== true) {
      console.error("[rsvp] Telegram API returned ok=false");
      return false;
    }
    return true;
  } catch (error) {
    const reason = error instanceof Error && error.name === "AbortError" ? "timeout" : "network error";
    console.error(`[rsvp] Telegram API request failed: ${reason}`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return fail(415, "unsupported_media_type");
  }

  if (!isSameOrigin(request)) {
    console.error("[rsvp] Request rejected: Origin does not match Host");
    return fail(403, "forbidden");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return fail(413, "payload_too_large");
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail(400, "invalid_json");
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return fail(413, "payload_too_large");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return fail(400, "invalid_json");
  }

  const address =
    payload !== null && typeof payload === "object" && "address" in payload
      ? sanitizeAddress((payload as { address: unknown }).address)
      : null;

  if (!address) {
    return fail(400, "invalid_address");
  }

  const retryAfter = checkRateLimit(getClientIp(request), Date.now());
  if (retryAfter > 0) {
    return fail(429, "rate_limited", { "Retry-After": String(retryAfter) });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    console.error("[rsvp] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured");
    return fail(500, "not_configured");
  }

  const delivered = await sendToTelegram(token, chatId, buildMessage(address));
  if (!delivered) {
    return fail(502, "telegram_failed");
  }

  return json(200, { ok: true });
}

function methodNotAllowed(): Response {
  return fail(405, "method_not_allowed", { Allow: "POST" });
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
