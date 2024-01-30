import type { ActionFunction } from "@remix-run/node";

import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action: ActionFunction = async ({ request }) => {
   const token = await getRequiredAuthToken(request);
   const form = await request.formData();
   await client<undefined>(`user/${form.get("userId")}/externaluserproviders`, {
      method: "PUT",
      body: form.getAll("externalUserId"),
      token,
   });
   return new Response("", { status: 200 });
};
