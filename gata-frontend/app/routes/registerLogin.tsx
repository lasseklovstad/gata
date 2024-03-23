import { Text } from "@chakra-ui/react";
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   const user = await authenticator.isAuthenticated(request);
   if (user) {
      await client("user/loggedin/create", { token: user.accessToken, method: "POST" });
      return redirect("/home");
   }
   return redirect("/login");
};

export default function RegisterLogin() {
   return <Text>Registrerer bruker...</Text>;
}
