import type { LoaderFunctionArgs } from "@remix-run/node";

import { createAuthenticator } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
   const { authenticator } = createAuthenticator();
   await authenticator.authenticate("TOTP", request, {
      successRedirect: "/home",
      failureRedirect: "/login-totp",
   });
}
