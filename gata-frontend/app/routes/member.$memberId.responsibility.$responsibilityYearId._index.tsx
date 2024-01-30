import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);

   if (request.method === "PUT") {
      const body = Object.fromEntries(await request.formData());
      await client(`user/${params.memberId}/responsibilityyear/${params.responsibilityYearId}/note`, {
         method: "PUT",
         body,
         token,
      });
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};
