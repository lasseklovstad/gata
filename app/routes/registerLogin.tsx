import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const { authenticator, getSessionLoginPath } = createAuthenticator();
   const auth0User = await authenticator.isAuthenticated(request);
   if (auth0User) {
      const redirectPath = await getSessionLoginPath(request);
      return redirect(redirectPath ?? "/home");
   }
   return redirect("/login");
};

export default function RegisterLogin() {
   return <Typography>Registrerer bruker...</Typography>;
}
