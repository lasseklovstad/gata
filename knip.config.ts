import type { KnipConfig } from "knip";

export default {
   entry: ["public/sw.js"],
   ignoreDependencies: ["isbot"],
} satisfies KnipConfig;
