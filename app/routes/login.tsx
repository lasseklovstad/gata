import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { createAuthenticator } from "~/utils/auth.server";

export const loader = () => redirect("/");

export const action = async ({ request }: ActionFunctionArgs) => {
   const { authenticator, sessionStorage } = createAuthenticator();
   const user = await authenticator.authenticate("auth0", request);

   const session = await sessionStorage.getSession(request.headers.get("cookie"));
   session.set("user", user);

   // commit the session
   const headers = new Headers({ "Set-Cookie": await sessionStorage.commitSession(session) });

   throw redirect("/registerLogin", { headers });
};
