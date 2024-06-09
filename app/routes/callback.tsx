import type { LoaderFunctionArgs } from "@remix-run/node";

import { createAuthenticator } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const { authenticator, getSessionLoginPath } = createAuthenticator();
   const successRedirect = await getSessionLoginPath(request);
   return authenticator.authenticate("auth0", request, {
      successRedirect,
      failureRedirect: "/login",
   });
};
