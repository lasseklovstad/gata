import type { ActionFunctionArgs } from "@remix-run/node";

import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action = async ({ params, request }: ActionFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   await client(`user/${params.memberId}/subscribe`, {
      method: "PUT",
      token,
   });
   return {};
};
