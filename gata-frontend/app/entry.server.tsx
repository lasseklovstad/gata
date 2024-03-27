import { CacheProvider } from "@emotion/react";
import type { EntryContext } from "@remix-run/cloudflare"; // Depends on the runtime you choose
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";

import { createEmotionServer } from "./styles/@emotion/server"; // https://github.com/emotion-js/emotion/issues/2446
import { ServerStyleContext } from "./styles/context";
import { createEmotionCache } from "./styles/createEmotionCache";

export default function handleRequest(
   request: Request,
   responseStatusCode: number,
   responseHeaders: Headers,
   remixContext: EntryContext
) {
   const cache = createEmotionCache();
   const { extractCriticalToChunks } = createEmotionServer(cache);

   const html = renderToString(
      <ServerStyleContext.Provider value={null}>
         <CacheProvider value={cache}>
            <RemixServer context={remixContext} url={request.url} />
         </CacheProvider>
      </ServerStyleContext.Provider>
   );

   const chunks = extractCriticalToChunks(html);

   const markup = renderToString(
      <ServerStyleContext.Provider value={chunks.styles}>
         <CacheProvider value={cache}>
            <RemixServer context={remixContext} url={request.url} />
         </CacheProvider>
      </ServerStyleContext.Provider>
   );

   responseHeaders.set("Content-Type", "text/html");

   return new Response(`<!DOCTYPE html>${markup}`, {
      status: responseStatusCode,
      headers: responseHeaders,
   });
}
