import { unstable_defineLoader as defineLoader, unstable_defineAction as defineAction } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";

import { getContingentInfo } from "~/.server/db/contigent";
import { getUsersThatHasNotPaidContingent } from "~/.server/db/user";
import { sendMail } from "~/.server/services/sendgrid";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { createAuthenticator } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";
import { isAdmin } from "~/utils/roleUtils";

export const loader = defineLoader(async ({ request }) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   if (!isAdmin(loggedInUser)) {
      throw new Error("Du har ikke tilgang her");
   }
   const today = new Date();
   // Todo: Hent ut brukere som ikke har betalt kontingent
   return {
      usersNotPaid: await getUsersThatHasNotPaidContingent(today.getFullYear()),
      contingentInfo: getContingentInfo(),
   };
});

export const action = defineAction(async ({ request }) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   if (!isAdmin(loggedInUser)) {
      throw new Error("Du har ikke tilgang her");
   }
   const today = new Date();
   const { size, bank } = getContingentInfo();
   const usersNotPaid = await getUsersThatHasNotPaidContingent(today.getFullYear());
   const url = new URL(request.url);
   await Promise.all(
      usersNotPaid.map((user) =>
         sendMail({
            html: `
      <h1>Betal kontigent</h1>
      <p>Du har ikke betalt kontigenten på ${user.amount ?? size}kr til ${bank}!</p>
      <p>Se det på ${url.origin}</p>
      `,
            to: [{ email: user.email }],
            subject: `Du har ikke betalt Gata-kontigenten for ${today.getFullYear()}!`,
         })
      )
   );
   return { ok: true, emails: usersNotPaid.map((user) => user.email) };
});

export default function ConfirmDelete() {
   const { dialogRef } = useDialog({ defaultOpen: true });
   const { usersNotPaid, contingentInfo } = useLoaderData<typeof loader>();
   const fetcher = useFetcher<typeof action>();
   const navigate = useNavigate();
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
            Er du sikker du vil sende e-post til alle brukere som ikke har betalt?
            <ul className="list-disc ml-6">
               {usersNotPaid.map((user) => (
                  <li key={user.id}>
                     {user.name} ({user.amount ?? contingentInfo.size})
                  </li>
               ))}
            </ul>
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
