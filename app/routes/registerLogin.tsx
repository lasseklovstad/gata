import { redirect, unstable_defineLoader as defineLoader } from "@remix-run/node";

import { insertOrUpdateExternalUser, insertUser, getNumberOfAdmins } from "~/.server/db/user";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { env } from "~/utils/env.server";
import { RoleName } from "~/utils/roleUtils";

export const loader = defineLoader(async ({ request }) => {
   const { authenticator, getSessionLoginPath } = createAuthenticator();
   const user = await authenticator.isAuthenticated(request);
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
});

export default function RegisterLogin() {
   return <Typography>Registrerer bruker...</Typography>;
}
