import type { ActionFunctionArgs } from "@remix-run/node";
import { Link, json, redirect, useFetcher } from "@remix-run/react";
import { Calendar } from "lucide-react";

import { insertEvent } from "~/.server/db/gataEvent";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { FormProvider } from "~/components/ui/form";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";

import { EventForm } from "./event.$eventId/EventForm";
import { eventSchema } from "./event.$eventId/eventSchema";

export const action = async ({ request }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const event = eventSchema.safeParse(await request.formData());
   if (!event.success) {
      return json({ ...event.error.formErrors }, { status: 400 });
   }
   const { startDate, startTime, description, title } = event.data;
   const eventId = await insertEvent({
      title,
      description,
      startTime: startTime ?? null,
      startDate: startDate ?? null,
      createdBy: loggedInUser.id,
   });
   return redirect(`/event/${eventId}`);
};

export default function NewEvent() {
   const form = useFetcher<typeof action>();
   const { dialogRef } = useDialog({ defaultOpen: true });
   return (
      <Dialog ref={dialogRef}>
         <DialogHeading>
            <Calendar /> Nytt arrangement
         </DialogHeading>
         <form.Form method="POST" className="space-y-2">
            <FormProvider errors={form.data?.fieldErrors}>
               <EventForm />
               <Typography>Dato kan bestemmes senere...</Typography>
            </FormProvider>
            <DialogFooter>
               <Button type="submit">Lagre</Button>
               <Button as={Link} to=".." variant="ghost">
                  Avbryt
               </Button>
            </DialogFooter>
         </form.Form>
      </Dialog>
   );
}
