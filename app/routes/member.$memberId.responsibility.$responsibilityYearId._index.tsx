import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { updateResponsibilityNote } from "~/.server/db/responsibility";
import { createAuthenticator } from "~/utils/auth.server";
import { updateResponsibilityYearSchema } from "~/utils/formSchema";

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   if (!params.responsibilityYearId) {
      throw new Error("ResponsibilityYearId id required");
   }
   const loggedInUser = await createAuthenticator(context).getRequiredUser(request);

   if (request.method === "PUT") {
      const { text } = updateResponsibilityYearSchema.parse(await request.formData());
      await updateResponsibilityNote(context, params.responsibilityYearId, text, loggedInUser);
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};
