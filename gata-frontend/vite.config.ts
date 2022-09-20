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
               if (id.includes("@chakra")) {
                  return "vendor_chakra";
               }
               if (id.includes("framer-motion")) {
                  return "vendor_framer-motion";
               }
               if (id.includes("@auth0")) {
                  return "vendor_auth0";
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
