import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData, useNavigate } from "react-router";

import { getReport } from "~/.server/db/report";
import { getSubscribedUsers } from "~/.server/db/user";
import { sendMail } from "~/.server/services/sendgrid";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { createAuthenticator } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
   await createAuthenticator().getRequiredUser(request);

   const reportEmails = await getSubscribedUsers();
   return { reportEmails };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
   if (!params.reportId) {
      throw new Error("Report id is required");
   }
   await createAuthenticator().getRequiredUser(request);
   const reportEmails = await getSubscribedUsers();
   const report = await getReport(params.reportId);
   const url = new URL(request.url);
   await sendMail({
      html: `
      <h1>Nytt fra Gata</h1>
      <p>Det har kommet en oppdatering på ${url.origin}!</p>
      <h2>${report.title}</h2>
      <p>${report.description}</p>
      <p>
         <a href='${url.origin}/reportInfo/${report.id}'>Trykk her for å lese hele saken!</a>
      </p>
      `,
      to: reportEmails.map((user) => ({ email: user.email })),
      subject: `Nytt fra Gata! ${report.title}`,
   });
   return { ok: true, emails: reportEmails.map((user) => user.email) };
};

export default function PublishReport() {
   const { dialogRef } = useDialog({ defaultOpen: true });
   const fetcher = useFetcher<typeof action>();
   const navigate = useNavigate();
   const { reportEmails } = useLoaderData<typeof loader>();
   const onClose = () => navigate("..");

   if (fetcher.data) {
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
