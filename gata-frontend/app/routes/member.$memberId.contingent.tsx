import type { ActionFunction } from "@remix-run/node";
import { client } from "~/old-app/api/client/client";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const form = Object.fromEntries(await request.formData());
   const year = form.year as string;
   const isPaid = !(form.hasPaid === "true");
   const body = { year, isPaid };

   return client(`user/${params.memberId}/contingent`, {
      method: "POST",
      body: JSON.stringify(body),
      token,
   });
};
