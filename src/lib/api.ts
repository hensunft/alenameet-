import { texts } from "../config/invitation";

export type RsvpResult = { ok: true } | { ok: false; message: string };

const REQUEST_TIMEOUT_MS = 15_000;

/** Отправляет адрес на сервер. Успех — только после подтверждения сервером. */
export async function sendRsvp(address: string): Promise<RsvpResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const errors = texts.invitation.errors;

  try {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    });

    const data = (await response.json().catch(() => null)) as { ok?: unknown; error?: unknown } | null;

    if (response.ok && data?.ok === true) return { ok: true };
    if (response.status === 429) return { ok: false, message: errors.rateLimited };
    if (data?.error === "invalid_address") return { ok: false, message: errors.empty };
    return { ok: false, message: errors.server };
  } catch {
    return { ok: false, message: errors.network };
  } finally {
    window.clearTimeout(timer);
  }
}
