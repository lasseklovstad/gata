import { redirect, type LoaderFunctionArgs } from "react-router";

import { getNumberOfAdmins, insertOrUpdateExternalUser, insertUser } from "~/.server/db/user";
import authenticator, { getSessionLoginPath, sessionStorage } from "~/utils/auth.server";
import { RoleName } from "~/utils/roleUtils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   try {
      const user = await authenticator.authenticate("auth0", request);
      const session = await sessionStorage.getSession(request.headers.get("cookie"));
      session.set("user", user);
      const headers = new Headers({ "Set-Cookie": await sessionStorage.commitSession(session) });
      const [externalUser] = await insertOrUpdateExternalUser(user);
      if (process.env.MAKE_FIRST_USER_ADMIN === "true") {
         const [{ count }] = await getNumberOfAdmins();
         if (count === 0) {
            await insertUser(externalUser.id, RoleName.Admin);
         }
      }
      const redirectPath = await getSessionLoginPath(request);
      return redirect(redirectPath ?? "/home", { headers });
   } catch (error) {
      if (error instanceof Error) {
         // here the error related to the authentication process
      }

      throw error; // Re-throw other values or unhandled errors
   }
};
