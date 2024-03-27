import { Text } from "@chakra-ui/react";
import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";

import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const user = await createAuthenticator(context).authenticator.isAuthenticated(request);
   if (user) {
      await client("user/loggedin/create", {
         token: user.accessToken,
         method: "POST",
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      });
      return redirect("/home");
   }
   return redirect("/login");
};

export default function RegisterLogin() {
   return <Text>Registrerer bruker...</Text>;
}
