import { redirect, useFetcher, useNavigate } from "react-router";

import { deleteReport } from "~/.server/db/report";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { getRequiredUser } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";

import type { Route } from "./+types/reportInfo.$reportId.$reportType.delete";

export const action = async ({ request, params }: Route.ActionArgs) => {
   await getRequiredUser(request);

   if (request.method === "DELETE") {
      await deleteReport(params.reportId);
      return redirect(params.reportType === "NEWS" ? "/" : "/report");
   }
};

export default function ConfirmDelete() {
   const { dialogRef } = useDialog({ defaultOpen: true });
   const navigate = useNavigate();
   const fetcher = useFetcher<typeof action>();
   const onClose = () => void navigate("..");

   return (
      <Dialog ref={dialogRef} onClose={onClose}>
         <fetcher.Form method="DELETE" preventScrollReset>
            <DialogHeading>Er du sikker?</DialogHeading>
            <div>Ved å slette mister brukeren ansvarsposten</div>
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
