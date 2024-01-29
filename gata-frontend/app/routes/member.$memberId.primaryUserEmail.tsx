import type { ActionFunction } from "@remix-run/node";
import { client } from "~/utils/client";
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
