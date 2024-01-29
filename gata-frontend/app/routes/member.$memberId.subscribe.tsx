import type { ActionFunction } from "@remix-run/node";
import { client } from "~/utils/client";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const action: ActionFunction = async ({ params, request }) => {
   const token = await getRequiredAuthToken(request);
   await client(`user/${params.memberId}/subscribe`, {
      method: "PUT",
      token,
   });
   return {};
};
