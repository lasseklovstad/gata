import { redirect } from "react-router";

import { updateResponsibilityNote } from "~/.server/db/responsibility";
import { getRequiredUser } from "~/utils/auth.server";
import { updateResponsibilityYearSchema } from "~/utils/formSchema";

import type { Route } from "./+types/member.$memberId.responsibility.$responsibilityYearId._index";

export const action = async ({ request, params }: Route.ActionArgs) => {
   const loggedInUser = await getRequiredUser(request);

   if (request.method === "PUT") {
      const { text } = updateResponsibilityYearSchema.parse(await request.formData());
      await updateResponsibilityNote(params.responsibilityYearId, text, loggedInUser);
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};
