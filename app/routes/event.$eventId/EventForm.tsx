import { formatDate, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar, X } from "lucide-react";
import { useId, useState } from "react";
import { DayPicker } from "react-day-picker";

import type { GataEvent } from "~/.server/db/gataEvent";
import { Button } from "~/components/ui/button";
import {
   FormControl,
   FormDescription,
   FormFieldset,
   FormItem,
   FormLabel,
   FormLegend,
   FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Typography } from "~/components/ui/typography";
import { dayPickerLabels } from "~/utils/date.utils";
import { useDialog } from "~/utils/dialogUtils";

type Props = {
   event?: GataEvent;
};

export const EventForm = ({ event }: Props) => {
   const currentYear = new Date().getFullYear();
   const dateDialog = useDialog({ defaultOpen: false });
   const dateDialogTitleId = useId();
   const [startDate, setStartDate] = useState(event?.startDate ? parseISO(event.startDate) : undefined);
   return (
      <>
         <FormItem name="title">
            <FormLabel>Tittel</FormLabel>
            <FormControl render={(props) => <Input {...props} defaultValue={event?.title} autoComplete="off" />} />
            <FormMessage />
         </FormItem>
         <FormItem name="description">
            <FormLabel>Beskrivelse</FormLabel>
            <FormControl
               render={(props) => <Textarea {...props} defaultValue={event?.description} autoComplete="off" />}
            />
            <FormMessage />
         </FormItem>
         <FormItem name="visibility">
            <FormFieldset>
               <FormLegend className="mb-2">Velg synlighet</FormLegend>
               <div className="flex gap-2 mb-2">
                  <Label className="flex items-center gap-2 cursor-pointer">
                     <input
                        className="size-4"
                        type="radio"
                        name="visibility"
                        value="everyone"
                        defaultChecked={!event || event.visibility === "everyone"}
                     />
                     Alle
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer">
                     <input
                        className="size-4"
                        type="radio"
                        name="visibility"
                        value="event-organizers"
                        defaultChecked={event?.visibility === "event-organizers"}
                     />
                     Arrangører
                  </Label>
               </div>
               <FormDescription>Hvis du velger alle vil det sendes ut en notifikasjon til alle i Gata</FormDescription>
            </FormFieldset>
            <FormMessage />
         </FormItem>
         <div className="flex gap-8">
            <FormItem name="startDate">
               <Label>Startdato</Label>
               <div className="flex gap-2 items-center relative">
                  <Input
                     name="startDate"
                     type="date"
                     readOnly
                     value={startDate ? formatDate(startDate, "yyyy-MM-dd") : ""}
                  />
                  <Button size="icon" variant="ghost" type="button" onClick={dateDialog.open}>
                     <Calendar />
                     <span className="sr-only">Åpne kalender</span>
                  </Button>
                  <dialog
                     aria-labelledby={dateDialogTitleId}
                     ref={dateDialog.dialogRef}
                     className="bg-background shadow-2xl rounded p-4 border"
                  >
                     <div className="flex justify-between items-center">
                        <Typography variant="h3" id={dateDialogTitleId}>
                           Velg dato
                        </Typography>
                        <Button type="button" variant="ghost" size="icon" onClick={dateDialog.close}>
                           <X />
                           <span className="sr-only">Lukk</span>
                        </Button>
                     </div>
                     <DayPicker
                        className="m-0 mt-2"
                        locale={nb}
                        mode="single"
                        labels={dayPickerLabels}
                        selected={startDate}
                        onSelect={(date) => {
                           dateDialog.close();
                           setStartDate(date);
                        }}
                        captionLayout="dropdown"
                        startMonth={new Date(currentYear, 0)}
                        endMonth={new Date(currentYear + 5, 0)}
                     />
                  </dialog>
               </div>
            </FormItem>
            <FormItem name="startTime" className="w-[100px]">
               <FormLabel>Starttidspunkt</FormLabel>
               <FormControl
                  render={(props) => (
                     <Input {...props} defaultValue={event?.startTime ?? ""} type="time" autoComplete="off" />
                  )}
               />
               <FormMessage />
            </FormItem>
         </div>
      </>
   );
};
