import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { deleteResponsibilityYear } from "~/.server/db/responsibility";
import { RouteConfirmFormDialog } from "~/components/RouteConfirmFormDialog";
import { createAuthenticator } from "~/utils/auth.server";

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   if (!params.responsibilityYearId) {
      throw new Error("ResponsibilityYearId id required");
   }
   await createAuthenticator(context).getRequiredUser(request);

   if (request.method === "DELETE") {
      await deleteResponsibilityYear(context, params.responsibilityYearId);
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};

export default function ConfirmDelete() {
   return <RouteConfirmFormDialog text="Ved å slette mister brukeren ansvarsposten" backTo=".." method="delete" />;
}
