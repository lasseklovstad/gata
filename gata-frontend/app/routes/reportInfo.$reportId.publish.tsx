import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { useDialog } from "~/utils/dialogUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const reportEmails = await client<string[]>(`report/publishemails`, {
      token,
      baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
   });
   return { reportEmails };
};

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const emails = await client<string[]>(`report/${params.reportId}/publish`, {
      token,
      baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
   });
   return json({ ok: true, emails });
};

export default function PublishReport() {
   const { dialogRef } = useDialog({ defaultOpen: true });
   const fetcher = useFetcher<typeof action>();
   const navigate = useNavigate();
   const { reportEmails } = useLoaderData<typeof loader>();
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
            Er du sikker du vil sende e-post til disse brukerne: {reportEmails.join(", ")}?
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
