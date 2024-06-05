import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { createAuthenticator } from "~/utils/auth.server";

export const loader = () => redirect("/");

export const action = ({ request, context }: ActionFunctionArgs) => {
   const { authenticator } = createAuthenticator(context);
   return authenticator.authenticate("auth0", request);
};
