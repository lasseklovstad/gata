import type { ActionFunction } from "@remix-run/node";

import { client } from "~/utils/client";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const form = Object.fromEntries(await request.formData());
   if (request.method === "POST" || request.method === "DELETE") {
      await client(`role/${form.roleId}/user/${params.memberId}`, {
         method: request.method,
         token,
      });
      return { ok: true };
   }
};
