import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { useFetcher, useNavigate } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { useDialog } from "~/utils/dialogUtils";

export const loader = () => {
   // Todo: Hent ut brukere som ikke har betalt kontingent
   return {};
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const emails = await client<string[]>("contingent/email", {
      token,
      baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
   });
   return { ok: true, emails };
};

export default function ConfirmDelete() {
   const { dialogRef } = useDialog({ defaultOpen: true });
   const fetcher = useFetcher<typeof action>();
   const navigate = useNavigate();
   const onClose = () => navigate("..");

   if (fetcher.data && fetcher.data.ok) {
      return (
         <Dialog ref={dialogRef}>
            <DialogHeading>Vellykket</DialogHeading>
            Det ble sent en email til: {fetcher.data.emails.length ? fetcher.data.emails.join(", ") : "Ingen"}
            <DialogFooter>
               <Button type="button" onClick={onClose}>
                  Ok
               </Button>
            </DialogFooter>
         </Dialog>
      );
   }

   return (
      <Dialog ref={dialogRef}>
         <fetcher.Form method="POST">
            <DialogHeading>Er du sikker?</DialogHeading>
            Er du sikker du vil sende e-post til alle brukere som ikke har betalt?
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
