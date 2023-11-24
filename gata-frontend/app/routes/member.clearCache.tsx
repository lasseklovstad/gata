import { json, type ActionFunction } from "@remix-run/node";
import { client } from "~/old-app/api/client/client";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
   const token = await getRequiredAuthToken(request);
   await client<undefined>("auth0user/update", {
      token,
   });
   return json({});
};
