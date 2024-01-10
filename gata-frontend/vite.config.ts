import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react(), eslint(), checker({ typescript: true })],
   define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
   },
   server: {
      port: 3000,
      proxy: {
         "/api": {
            target: "http://localhost:8080",
         },
      },
   },
   build: {
      outDir: "build",
   },
});
