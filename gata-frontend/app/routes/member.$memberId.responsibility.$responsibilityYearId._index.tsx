import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);

   if (request.method === "PUT") {
      const body = Object.fromEntries(await request.formData());
      await client(`user/${params.memberId}/responsibilityyear/${params.responsibilityYearId}/note`, {
         method: "PUT",
         body,
         token,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      });
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};
