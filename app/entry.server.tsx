import { createReadableStreamFromReadable } from "@react-router/node";
import * as Sentry from "@sentry/react-router";
import { renderToPipeableStream } from "react-dom/server";
import { ServerRouter } from "react-router";

import { getEnv, init } from "./utils/env.server";

init();
global.ENV = getEnv();

const handleRequest = Sentry.createSentryHandleRequest({
   ServerRouter,
   renderToPipeableStream,
   createReadableStreamFromReadable,
});

export default handleRequest;

export const handleError = Sentry.createSentryHandleError({
   logErrors: false,
});
