import { redirect } from "react-router";

import authenticator from "~/utils/auth.server";

import type { Route } from "./+types/login";

export const loader = () => redirect("/");

export const action = async ({ request }: Route.ActionArgs) => {
   await authenticator.authenticate("auth0", request);
};
