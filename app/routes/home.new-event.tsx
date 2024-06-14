import type { ActionFunctionArgs } from "@remix-run/node";
import { Link, json, redirect, useFetcher } from "@remix-run/react";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { insertEvent } from "~/.server/db/gataEvent";

import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { createAuthenticator } from "~/utils/auth.server";
import { useDialog } from "~/utils/dialogUtils";

const eventSchema = zfd.formData({
   title: zfd.text(z.string()),
   description: zfd.text(z.string().optional().default("")),
   // format: YYYY-MM-DD
   dateOption: zfd.repeatable(z.array(z.coerce.date())),
   isAnonymous: zfd.checkbox(),
   canAddSuggestions: zfd.checkbox(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const event = eventSchema.safeParse(await request.formData());
   if (!event.success) {
      return json({ ...event.error.formErrors }, { status: 400 });
   }
   const { title, canAddSuggestions, dateOption, description, isAnonymous } = event.data;
   const eventId = await insertEvent(
      { title, description, createdBy: loggedInUser.id },
      { name: "Hvilken dato passer for deg?", canAddSuggestions, isAnonymous, canSelectMultiple: true, type: "date" },
      dateOption
   );
   return redirect(`/event/${eventId}`);
};

export default function NewEvent() {
   const form = useFetcher<typeof action>();
   const [selectedDates, setSelectedDates] = useState<Date[]>();
   const { dialogRef } = useDialog({ defaultOpen: true });
   return (
      <Dialog ref={dialogRef}>
         <DialogHeading>
            <Calendar /> Nytt arrangement
         </DialogHeading>
         <form.Form method="POST" className="space-y-2">
            <FormProvider errors={form.data?.fieldErrors}>
               <FormItem name="title">
                  <FormLabel>Navn</FormLabel>
                  <FormControl render={(props) => <Input {...props} autoComplete="off" />} />
                  <FormMessage />
               </FormItem>
               <FormItem name="description">
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl render={(props) => <Textarea {...props} autoComplete="off" />} />
                  <FormMessage />
               </FormItem>
               <div>
                  <FormItem name="dateOption">
                     <Label>Velg datoer for avstemning</Label>
                     {selectedDates?.map((selectedDate) => (
                        <input
                           name="dateOption"
                           readOnly
                           hidden
                           value={formatDate(selectedDate, "yyyy-MM-dd")}
                           key={selectedDate.valueOf()}
                        />
                     ))}
                     <DayPicker
                        className="m-0 mt-2"
                        locale={nb}
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                     />
                     <FormMessage />
                  </FormItem>
               </div>
               <div>
                  <FormItem name="isAnonymous">
                     <div className="flex gap-2 py-3 cursor-pointer">
                        <FormControl
                           render={(props) => <input {...props} className="cursor-pointer size-4" type="checkbox" />}
                        />
                        <FormLabel className="cursor-pointer">Anonym avstemning</FormLabel>
                     </div>
                  </FormItem>
                  <FormItem name="canAddSuggestions">
                     <div className="flex gap-2 py-3 cursor-pointer">
                        <FormControl
                           render={(props) => <input {...props} className="cursor-pointer size-4" type="checkbox" />}
                        />
                        <FormLabel className="cursor-pointer">La brukere foreslå andre tidspunkt</FormLabel>
                     </div>
                  </FormItem>
               </div>
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
