import { redirect, type LoaderFunctionArgs } from "react-router";

import { createAuthenticator } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   try {
      const { authenticator, sessionStorage } = createAuthenticator();
      const user = await authenticator.authenticate("auth0", request);
      let session = await sessionStorage.getSession(request.headers.get("cookie"));
      session.set("user", user);

      // commit the session
      let headers = new Headers({ "Set-Cookie": await sessionStorage.commitSession(session) });

      return redirect("/registerLogin", { headers });
   } catch (error) {
      if (error instanceof Error) {
         // here the error related to the authentication process
      }

      throw error; // Re-throw other values or unhandled errors
   }
};
