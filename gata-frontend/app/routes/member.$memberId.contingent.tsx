import type { ActionFunctionArgs } from "@remix-run/node";

import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const form = Object.fromEntries(await request.formData());
   const year = form.year as string;
   const isPaid = !(form.hasPaid === "true");
   const body = { year, isPaid };
   await client(`user/${params.memberId}/contingent`, {
      method: "POST",
      body: JSON.stringify(body),
      token,
   });

   return { ok: true };
};
