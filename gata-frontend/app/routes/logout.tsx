import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { createAuthenticator } from "~/utils/auth.server";

export const loader = async ({ request, context }: ActionFunctionArgs) => {
   const {
      cloudflare: { env },
   } = context;
   const { getSession, destroySession } = createAuthenticator(context);
   const session = await getSession(request.headers.get("Cookie"));
   const logoutURL = new URL(`https://${env.AUTH0_DOMAIN}/v2/logout`); // i.e https://YOUR_TENANT.us.auth0.com/v2/logout

   logoutURL.searchParams.set("client_id", env.AUTH0_CLIENT_ID!);
   logoutURL.searchParams.set("returnTo", env.AUTH0_RETURN_TO_URL!);

   return redirect(logoutURL.toString(), {
      headers: {
         "Set-Cookie": await destroySession(session),
      },
   });
};
