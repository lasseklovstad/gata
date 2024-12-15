import { redirect, useFetcher, useNavigate } from "react-router";

import { deleteResponsibility } from "~/.server/db/responsibility";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { getRequiredUser } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";
import { RoleName } from "~/utils/roleUtils";

import type { Route } from "./+types/responsibility.$responsibilityId.delete";

export const action = async ({ request, params: { responsibilityId } }: Route.ActionArgs) => {
   await getRequiredUser(request, [RoleName.Admin]);

   if (request.method === "DELETE") {
      await deleteResponsibility(responsibilityId);
      return redirect("/responsibility");
   }
};

export default function ConfirmDeleteResponsibility() {
   const { dialogRef } = useDialog({ defaultOpen: true });
   const navigate = useNavigate();
   const fetcher = useFetcher<typeof action>();
   const onClose = () => navigate("..");

   return (
      <Dialog ref={dialogRef} onClose={() => void onClose()}>
         <fetcher.Form method="DELETE" preventScrollReset>
            <DialogHeading>Er du sikker?</DialogHeading>
            <div>Ved å slette ansvarsposten mister du all data</div>
            <DialogFooter>
               <Button type="submit" isLoading={fetcher.state !== "idle"}>
                  Jeg er sikker
               </Button>
               <Button type="button" onClick={() => void onClose()} variant="ghost">
                  Avbryt
               </Button>
            </DialogFooter>
         </fetcher.Form>
      </Dialog>
   );
}
