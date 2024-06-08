import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

import { insertOrUpdateExternalUser, insertUser, getNumberOfAdmins } from "~/.server/db/user";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { env } from "~/utils/env.server";
import { RoleName } from "~/utils/roleUtils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const user = await createAuthenticator().authenticator.isAuthenticated(request);
   if (user) {
      const [externalUser] = await insertOrUpdateExternalUser(user);
      if (env.MAKE_FIRST_USER_ADMIN === "true") {
         const [{ count }] = await getNumberOfAdmins();
         if (count === 0) {
            await insertUser(externalUser.id, RoleName.Admin);
         }
      }
      return redirect("/home");
   }
   return redirect("/login");
};

export default function RegisterLogin() {
   return <Typography>Registrerer bruker...</Typography>;
}
