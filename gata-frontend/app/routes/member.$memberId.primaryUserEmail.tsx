import type { ActionFunction } from "@remix-run/node";
import { client } from "~/old-app/api/client/client";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const form = Object.fromEntries(await request.formData());
   await client(`user/${params.memberId}/primaryuser`, {
      method: "PUT",
      body: form.primaryUserEmail,
      token,
   });
   return {};
};
