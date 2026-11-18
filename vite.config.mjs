import { defineConfig } from "vite";
import { api } from "./scripts/api.mjs";
const attach = (server) => {
  server.middlewares.use(api());
};
export default defineConfig({
  server: {
    host: "127.0.0.1",
    fs: {
      deny: [
        "**/data/**",
        "**/.local/**",
        "**/scripts/**",
        "**/.env*",
        "**/.git/**",
      ],
    },
  },
  preview: { host: "127.0.0.1" },
  plugins: [
    {
      name: "isolated-kitchen-api",
      configureServer: attach,
      configurePreviewServer: attach,
    },
  ],
});
