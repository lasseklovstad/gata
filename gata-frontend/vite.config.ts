import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react(), eslint()],
   define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
   },
   server: {
      port: 4040,
      proxy: {
         "/api": {
            target: "http://localhost:8080",
         },
      },
   },
   build: {
      outDir: "build",
      rollupOptions: {
         manualChunks: (id) => {
            if (id.includes("node_modules")) {
               if (id.includes("@mui")) {
                  return "vendor_mui";
               }
               if (id.includes("slate")) {
                  return "vendor_slate";
               }
               return "vendor"; // all other package goes here
            }
         },
      },
   },
});
