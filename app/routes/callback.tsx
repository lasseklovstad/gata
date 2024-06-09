import type { LoaderFunctionArgs } from "@remix-run/node";

import { createAuthenticator } from "~/utils/auth.server";

export const loader = ({ request }: LoaderFunctionArgs) => {
   return createAuthenticator().authenticator.authenticate("auth0", request, {
      successRedirect: "/registerLogin",
      failureRedirect: "/login",
   });
};
