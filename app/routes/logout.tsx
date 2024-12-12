import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { createAuthenticator } from "~/utils/auth.server";
import { env } from "~/utils/env.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const { sessionStorage } = createAuthenticator();
   const session = await sessionStorage.getSession(request.headers.get("Cookie"));
   const logoutURL = new URL(`https://${env.AUTH0_DOMAIN}/v2/logout`); // i.e https://YOUR_TENANT.us.auth0.com/v2/logout

   const url = new URL(request.url);
   url.protocol = url.hostname === "localhost" ? "http:" : "https:";
   const returnTo = url.origin;
   logoutURL.searchParams.set("client_id", env.AUTH0_CLIENT_ID);
   logoutURL.searchParams.set("returnTo", returnTo);

   return redirect(logoutURL.toString(), {
      headers: {
         "Set-Cookie": await sessionStorage.destroySession(session),
      },
   });
};
