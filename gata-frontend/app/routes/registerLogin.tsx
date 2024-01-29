import { redirect, type LoaderFunction } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader: LoaderFunction = async ({ request }) => {
   const user = await authenticator.isAuthenticated(request);
   if (user) {
      await client("user/loggedin/create", { token: user.accessToken, method: "POST" });
      return redirect("/home");
   }
   return redirect("/login");
};
