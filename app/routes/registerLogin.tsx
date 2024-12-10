import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { insertOrUpdateExternalUser, insertUser, getNumberOfAdmins } from "~/.server/db/user";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { env } from "~/utils/env.server";
import { RoleName } from "~/utils/roleUtils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const { sessionStorage, getSessionLoginPath } = createAuthenticator();
   const session = await sessionStorage.getSession(request.headers.get("cookie"));
   const user = session.get("user");
   if (user) {
      const [externalUser] = await insertOrUpdateExternalUser(user);
      if (env.MAKE_FIRST_USER_ADMIN === "true") {
         const [{ count }] = await getNumberOfAdmins();
         if (count === 0) {
            await insertUser(externalUser.id, RoleName.Admin);
         }
      }
      const redirectPath = await getSessionLoginPath(request);
      return redirect(redirectPath ?? "/home");
   }
   return redirect("/login");
};

export default function RegisterLogin() {
   return <Typography>Registrerer bruker...</Typography>;
}
