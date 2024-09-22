import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher, useNavigate } from "@remix-run/react";

import { deleteResponsibility } from "~/.server/db/responsibility";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { createAuthenticator } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";
import { isAdmin } from "~/utils/roleUtils";

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);

   if (!isAdmin(loggedInUser)) {
      throw new Error("Du har ikke tilgang til å endre denne ressursen");
   }

   if (request.method === "DELETE" && params.responsibilityId) {
      await deleteResponsibility(params.responsibilityId);
      return redirect("/responsibility");
   }
};

export default function ConfirmDeleteResponsibility() {
   const { dialogRef } = useDialog({ defaultOpen: true });
   const navigate = useNavigate();
   const fetcher = useFetcher<typeof action>();
   const onClose = () => navigate("..");

   return (
      <Dialog ref={dialogRef} onClose={onClose}>
         <fetcher.Form method="DELETE" preventScrollReset>
            <DialogHeading>Er du sikker?</DialogHeading>
            <div>Ved å slette ansvarsposten mister du all data</div>
            <DialogFooter>
               <Button type="submit" isLoading={fetcher.state !== "idle"}>
                  Jeg er sikker
               </Button>
               <Button type="button" onClick={onClose} variant="ghost">
                  Avbryt
               </Button>
            </DialogFooter>
         </fetcher.Form>
      </Dialog>
   );
}
