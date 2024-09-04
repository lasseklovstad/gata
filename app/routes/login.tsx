import {
   unstable_defineAction as defineAction,
   unstable_defineLoader as defineLoader,
   redirect,
} from "@remix-run/node";

import { createAuthenticator } from "~/utils/auth.server";

export const loader = defineLoader(() => redirect("/"));

export const action = defineAction(async ({ request }) => {
   const { authenticator } = createAuthenticator();
   return await authenticator.authenticate("auth0", request);
});
