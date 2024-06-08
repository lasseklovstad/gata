import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { createAuthenticator } from "~/utils/auth.server";
import { env } from "~/utils/env.server";

export const loader = async ({ request }: ActionFunctionArgs) => {
   const { getSession, destroySession } = createAuthenticator();
   const session = await getSession(request.headers.get("Cookie"));
   const logoutURL = new URL(`https://${env.AUTH0_DOMAIN}/v2/logout`); // i.e https://YOUR_TENANT.us.auth0.com/v2/logout

   const url = new URL(request.url);
   const returnTo = url.origin;
   logoutURL.searchParams.set("client_id", env.AUTH0_CLIENT_ID!);
   logoutURL.searchParams.set("returnTo", returnTo);

   return redirect(logoutURL.toString(), {
      headers: {
         "Set-Cookie": await destroySession(session),
      },
   });
};
