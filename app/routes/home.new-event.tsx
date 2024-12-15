import { Calendar } from "lucide-react";
import { Link, redirect, useFetcher } from "react-router";

import { createEventAndNotify } from "~/.server/data-layer/gataEvent";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { FormProvider } from "~/components/ui/form";
import { Typography } from "~/components/ui/typography";
import { getRequiredUser } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";
import { transformErrorResponse } from "~/utils/validateUtils";

import type { Route } from "./+types/home.new-event";
import { EventForm } from "./event.$eventId/EventForm";
import { eventSchema } from "../utils/schemas/eventSchema";

export const action = async ({ request }: Route.ActionArgs) => {
   const loggedInUser = await getRequiredUser(request);
   const event = eventSchema.safeParse(await request.formData());
   if (!event.success) {
      return transformErrorResponse(event.error);
   }
   const eventId = await createEventAndNotify(loggedInUser, event.data);
   return redirect(`/event/${eventId}`);
};

export default function NewEvent() {
   const fetcher = useFetcher<typeof action>();
   const { dialogRef } = useDialog({ defaultOpen: true });
   return (
      <Dialog ref={dialogRef}>
         <DialogHeading>
            <Calendar /> Nytt arrangement
         </DialogHeading>
         <fetcher.Form method="POST" className="space-y-2">
            <FormProvider errors={fetcher.data && "errors" in fetcher.data ? fetcher.data.errors : undefined}>
               <EventForm />
               <Typography>Dato kan bestemmes senere...</Typography>
            </FormProvider>
            <DialogFooter>
               <Button type="submit">Lagre</Button>
               <Button as={Link} to=".." variant="ghost">
                  Avbryt
               </Button>
            </DialogFooter>
         </fetcher.Form>
      </Dialog>
   );
}
