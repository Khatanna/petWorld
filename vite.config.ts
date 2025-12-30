import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@modules": fileURLToPath(new URL("./src/modules", import.meta.url)),
      },
    },
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      quasar({
        sassVariables: fileURLToPath(
          new URL("./src/quasar-variables.sass", import.meta.url),
        ),
      }),
      VitePWA({
        registerType: "prompt",
        includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: "/index.html",
          globPatterns: [
            "**/*.{js,css,html,png,svg,ico,json,woff2,ttf,woff,eot}",
          ],
        },
        manifest: {
          name: env.VITE_TENANT_NAME,
          short_name: env.VITE_TENANT_NAME,
          description: "Sistema de gestión para clínicas veterinarias",
          theme_color: env.VITE_PRIMARY_COLOR,
          display: "standalone",
          background_color: "#ffffff",
          icons: [
            {
              src: "logo-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "logo-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "logo-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
      }),
    ],
  };
});
