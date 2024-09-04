import { unstable_defineAction as defineAction, redirect } from "@remix-run/node";

import { updateResponsibilityNote } from "~/.server/db/responsibility";
import { createAuthenticator } from "~/utils/auth.server";
import { updateResponsibilityYearSchema } from "~/utils/formSchema";

export const action = defineAction(async ({ request, params }) => {
   if (!params.responsibilityYearId) {
      throw new Error("ResponsibilityYearId id required");
   }
   const loggedInUser = await createAuthenticator().getRequiredUser(request);

   if (request.method === "PUT") {
      const { text } = updateResponsibilityYearSchema.parse(await request.formData());
      await updateResponsibilityNote(params.responsibilityYearId, text, loggedInUser);
   }

   return redirect(`/member/${params.memberId}/responsibility`);
});
