import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

type Handler = (request: Request) => Promise<Response> | Response;

/**
 * Локальная эмуляция Vercel-функций для `npm run dev`:
 * запросы к /api/<name> передаются в api/<name>.ts (Web-сигнатура Request → Response).
 * В продакшене этот код не используется — там функции запускает Vercel.
 */
export function apiDevServer(env: Record<string, string>): Plugin {
  return {
    name: "local-api-dev-server",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      for (const [key, value] of Object.entries(env)) {
        if (key.startsWith("TELEGRAM_") && process.env[key] === undefined) {
          process.env[key] = value;
        }
      }

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const match = /^\/api\/([a-z0-9-]+)\/?$/i.exec(url.pathname);
        if (!match) return next();

        try {
          const mod = (await server.ssrLoadModule(`/api/${match[1]}.ts`)) as Record<string, unknown>;
          const method = (req.method ?? "GET").toUpperCase();
          const handler = mod[method] as Handler | undefined;

          if (typeof handler !== "function") {
            res.statusCode = 405;
            res.end();
            return;
          }

          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);

          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === "string") headers.set(key, value);
            else if (Array.isArray(value)) headers.set(key, value.join(", "));
          }
          if (!headers.has("x-forwarded-for")) {
            headers.set("x-forwarded-for", req.socket.remoteAddress ?? "127.0.0.1");
          }

          const request = new Request(new URL(url.pathname + url.search, `http://${req.headers.host}`), {
            method,
            headers,
            body: method === "GET" || method === "HEAD" ? undefined : Buffer.concat(chunks),
          });

          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.config.logger.error(`[api] ${error instanceof Error ? error.message : String(error)}`);
          res.statusCode = 500;
          res.end();
        }
      });
    },
  };
}
