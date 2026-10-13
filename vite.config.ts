import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { apiDevServer } from "./dev/apiDevServer";

/**
 * Подставляет абсолютный адрес сайта в Open Graph теги:
 * Telegram и другие мессенджеры требуют абсолютные ссылки на превью.
 */
function siteUrl(env: Record<string, string>): Plugin {
  const raw =
    env.SITE_URL ||
    (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : "");
  const base = raw.replace(/\/+$/, "");

  return {
    name: "site-url",
    transformIndexHtml(html) {
      return html.replaceAll("__SITE_URL__", base);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env } as Record<string, string>;

  return {
    plugins: [react(), tailwindcss(), siteUrl(env), apiDevServer(env)],
    server: { host: true },
  };
});
