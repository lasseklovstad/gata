import type { EmotionCache } from "@emotion/utils";

function createExtractCriticalToChunks(cache: EmotionCache) {
   return function (html: string) {
      const RGX = new RegExp(`${cache.key}-([a-zA-Z0-9-_]+)`, "gm");

      const o: {
         html: string;
         styles: { key: string; ids: string[]; css: string | boolean }[];
      } = { html, styles: [] };
      let match;
      const ids: { [key: string]: boolean } = {};
      while ((match = RGX.exec(html)) !== null) {
         if (ids[match[1]] === undefined) {
            ids[match[1]] = true;
         }
      }

      const regularCssIds: string[] = [];
      let regularCss = "";

      Object.keys(cache.inserted).forEach((id) => {
         if (
            (ids[id] !== undefined || cache.registered[`${cache.key}-${id}`] === undefined) &&
            cache.inserted[id] !== true
         ) {
            if (cache.registered[`${cache.key}-${id}`]) {
               regularCssIds.push(id);
               regularCss += cache.inserted[id];
            } else {
               o.styles.push({
                  key: `${cache.key}-global`,
                  ids: [id],
                  css: cache.inserted[id],
               });
            }
         }
      });

      o.styles.push({ key: cache.key, ids: regularCssIds, css: regularCss });

      return o;
   };
}

function generateStyleTag(cssKey: string, ids: string, styles: string | boolean, nonceString: string) {
   return `<style data-emotion="${cssKey} ${ids}"${nonceString}>${styles}</style>`;
}

function createConstructStyleTagsFromChunks(cache: EmotionCache, nonceString: string) {
   return function (criticalData: ReturnType<ReturnType<typeof createExtractCriticalToChunks>>) {
      let styleTagsString = "";

      criticalData.styles.forEach((item) => {
         styleTagsString += generateStyleTag(item.key, item.ids.join(" "), item.css, nonceString);
      });

      return styleTagsString;
   };
}

export function createEmotionServer(cache: EmotionCache) {
   if (cache.compat !== true) {
      cache.compat = true;
   }
   const nonceString = cache.nonce !== undefined ? ` nonce="${cache.nonce}"` : "";
   return {
      extractCriticalToChunks: createExtractCriticalToChunks(cache),
      constructStyleTagsFromChunks: createConstructStyleTagsFromChunks(cache, nonceString),
   };
}
