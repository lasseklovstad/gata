import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { getReport } from "~/.server/db/report";
import { getSubscribedUsers } from "~/.server/db/user";
import { sendMail } from "~/.server/services/sendgrid";

import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { useDialog } from "~/utils/dialogUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   await createAuthenticator(context).getRequiredUser(request);

   const reportEmails = await getSubscribedUsers(context);
   return { reportEmails };
};

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   if (!params.reportId) {
      throw new Error("Report id is required");
   }
   await createAuthenticator(context).getRequiredUser(request);
   const reportEmails = await getSubscribedUsers(context);
   const report = await getReport(context, params.reportId);
   const url = new URL(request.url);
   await Promise.all(
      reportEmails.map((user) => {
         if (!user.email) {
            throw new Error("Bruker har ikke email " + user.id);
         }
         return sendMail(context, {
            html: `
            <h1>Nytt fra Gata</h1>
            <p>Det har kommet en oppdatering på ${url.origin}!</p>
            <h2>${report.title}</h2>
            <p>${report.description}</p>
            <p>
               <a href='${url.origin}/reportInfo/${report.id}'>Trykk her for å lese hele saken!</a>
            </p>
            `,
            to: user.email,
            subject: `Nytt fra Gata! ${report.title}`,
         });
      })
   );
   return json({ ok: true, emails: reportEmails.map((user) => user.email) });
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
            Er du sikker du vil sende e-post til disse brukerne: {reportEmails.map((user) => user.email).join(", ")}?
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
