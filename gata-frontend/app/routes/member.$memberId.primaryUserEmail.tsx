import type { ActionFunctionArgs } from "@remix-run/node";

import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const form = Object.fromEntries(await request.formData());
   await client(`user/${params.memberId}/primaryuser`, {
      method: "PUT",
      body: form.primaryUserEmail,
      token,
   });
   return {};
};
