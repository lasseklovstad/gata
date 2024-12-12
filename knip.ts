import path from "path";
import { fileURLToPath } from "url";

import type { RouteConfigEntry } from "@react-router/dev/routes";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const appDir = __dirname + "/app";
globalThis.__reactRouterAppDirectory = appDir;
const routes = await import("./app/routes");

const routeConfig = await routes.default;

const mapRoute = (route: RouteConfigEntry): string[] => {
   return [`app/${route.file}`, ...(route.children ? route.children.flatMap(mapRoute) : [])];
};
const routeEntryFiles = routeConfig.flatMap(mapRoute);
export default {
   entry: [
      ...routeEntryFiles,
      "public/sw.js",
      "server.mjs",
      "app/root.tsx",
      "app/entry.client.tsx",
      "app/entry.server.tsx",
      "react-router.config.ts",
   ],
};
