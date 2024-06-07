import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { deleteResponsibility } from "~/.server/db/responsibility";
import { RouteConfirmFormDialog } from "~/components/RouteConfirmFormDialog";
import { createAuthenticator } from "~/utils/auth.server";
import { isAdmin } from "~/utils/roleUtils";

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator(context).getRequiredUser(request);

   if (!isAdmin(loggedInUser)) {
      throw new Error("Du har ikke tilgang til å endre denne ressursen");
   }

   if (request.method === "DELETE" && params.responsibilityId) {
      await deleteResponsibility(context, params.responsibilityId);
      return redirect("/responsibility");
   }
};

export default function ConfirmDeleteResponsibility() {
   return <RouteConfirmFormDialog text="Ved å slette ansvarsposten mister du all data" backTo=".." method="DELETE" />;
}
