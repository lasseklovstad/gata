import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { RouteConfirmFormDialog } from "~/old-app/RouteConfirmFormDialog";
import { client } from "~/old-app/api/client/client";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);

   if (request.method === "DELETE") {
      await client(`user/${params.memberId}/responsibilityyear/${params.responsibilityYearId}`, {
         method: "DELETE",
         token,
      });
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};

export default function ConfirmDelete() {
   return <RouteConfirmFormDialog text="Ved å slette mister brukeren ansvarsposten" backTo=".." method="delete" />;
}
