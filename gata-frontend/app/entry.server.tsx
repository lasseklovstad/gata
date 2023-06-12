/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { PassThrough } from "node:stream";

import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import isbot from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import createEmotionCache from "./createEmotionCache";
import createEmotionServer from "@emotion/server/create-instance";
import { CacheProvider as EmotionCacheProvider } from "@emotion/react";

const ABORT_DELAY = 5_000;

export default function handleRequest(
   request: Request,
   responseStatusCode: number,
   responseHeaders: Headers,
   remixContext: EntryContext
) {
   return isbot(request.headers.get("user-agent"))
      ? handleBotRequest(request, responseStatusCode, responseHeaders, remixContext)
      : handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext);
}

function handleBotRequest(
   request: Request,
   responseStatusCode: number,
   responseHeaders: Headers,
   remixContext: EntryContext
) {
   const emotionCache = createEmotionCache();
   return new Promise((resolve, reject) => {
      const { pipe, abort } = renderToPipeableStream(
         <EmotionCacheProvider value={emotionCache}>
            <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />
         </EmotionCacheProvider>,
         {
            onAllReady() {
               const reactBody = new PassThrough();
               const emotionServer = createEmotionServer(emotionCache);

               const bodyWithStyles = emotionServer.renderStylesToNodeStream();
               reactBody.pipe(bodyWithStyles);

               responseHeaders.set("Content-Type", "text/html");

               resolve(
                  new Response(bodyWithStyles, {
                     headers: responseHeaders,
                     status: responseStatusCode,
                  })
               );

               pipe(reactBody);
            },
            onShellError(error: unknown) {
               reject(error);
            },
            onError(error: unknown) {
               responseStatusCode = 500;
               console.error(error);
            },
         }
      );

      setTimeout(abort, ABORT_DELAY);
   });
}

function handleBrowserRequest(
   request: Request,
   responseStatusCode: number,
   responseHeaders: Headers,
   remixContext: EntryContext
) {
   const emotionCache = createEmotionCache();

   return new Promise((resolve, reject) => {
      const { pipe, abort } = renderToPipeableStream(
         <EmotionCacheProvider value={emotionCache}>
            <RemixServer context={remixContext} url={request.url} abortDelay={ABORT_DELAY} />
         </EmotionCacheProvider>,
         {
            onShellReady() {
               const reactBody = new PassThrough();
               const emotionServer = createEmotionServer(emotionCache);

               const bodyWithStyles = emotionServer.renderStylesToNodeStream();
               reactBody.pipe(bodyWithStyles);

               responseHeaders.set("Content-Type", "text/html");

               resolve(
                  new Response(bodyWithStyles, {
                     headers: responseHeaders,
                     status: responseStatusCode,
                  })
               );

               pipe(reactBody);
            },
            onShellError(error: unknown) {
               reject(error);
            },
            onError(error: unknown) {
               console.error(error);
               responseStatusCode = 500;
            },
         }
      );

      setTimeout(abort, ABORT_DELAY);
   });
}
