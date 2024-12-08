import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { createAuthenticator } from "~/utils/auth.server";

export const loader = () => redirect("/");

export const action = async ({ request }: ActionFunctionArgs) => {
   const { authenticator, sessionStorage } = createAuthenticator();
   let user = await authenticator.authenticate("auth0", request);

   let session = await sessionStorage.getSession(request.headers.get("cookie"));
   session.set("user", user);

   // commit the session
   let headers = new Headers({ "Set-Cookie": await sessionStorage.commitSession(session) });
};
