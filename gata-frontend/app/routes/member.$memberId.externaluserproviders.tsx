import type { ActionFunctionArgs } from "@remix-run/node";

import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action = async ({ request }: ActionFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const form = await request.formData();
   await client(`user/${form.get("userId")}/externaluserproviders`, {
      method: "PUT",
      body: form.getAll("externalUserId"),
      token,
   });
   return { ok: true };
};
