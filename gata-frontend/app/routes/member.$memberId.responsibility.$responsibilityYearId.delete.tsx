import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { RouteConfirmFormDialog } from "~/old-app/RouteConfirmFormDialog";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const action = async ({ request, params }: ActionFunctionArgs) => {
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
