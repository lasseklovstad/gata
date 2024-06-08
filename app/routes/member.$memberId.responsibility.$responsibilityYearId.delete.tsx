import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { deleteResponsibilityYear } from "~/.server/db/responsibility";
import { RouteConfirmFormDialog } from "~/components/RouteConfirmFormDialog";
import { createAuthenticator } from "~/utils/auth.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
   if (!params.responsibilityYearId) {
      throw new Error("ResponsibilityYearId id required");
   }
   await createAuthenticator().getRequiredUser(request);

   if (request.method === "DELETE") {
      await deleteResponsibilityYear(params.responsibilityYearId);
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};

export default function ConfirmDelete() {
   return <RouteConfirmFormDialog text="Ved å slette mister brukeren ansvarsposten" backTo=".." method="delete" />;
}
