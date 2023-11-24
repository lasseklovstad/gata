import { redirect, type ActionArgs } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server";

export const loader = () => redirect("/");

export const action = ({ request }: ActionArgs) => {
   return authenticator.authenticate("auth0", request);
};
