import { unstable_defineLoader as defineLoader } from "@remix-run/node";

import { createAuthenticator } from "~/utils/auth.server";

export const loader = defineLoader(({ request }) => {
   return createAuthenticator().authenticator.authenticate("auth0", request, {
      successRedirect: "/registerLogin",
      failureRedirect: "/login",
   });
});
