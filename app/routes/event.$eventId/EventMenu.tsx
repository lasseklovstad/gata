import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { formatDate, parseISO } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar, Edit, EllipsisVertical, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";

import type { GataEvent } from "~/.server/db/gataEvent";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Typography } from "~/components/ui/typography";
import { useDialog } from "~/utils/dialogUtils";

import type { action } from "./route";

type Props = {
   event: SerializeFrom<GataEvent>;
   numberOfImages: number;
};

export const EventMenu = ({ event, numberOfImages }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const [open, setOpen] = useState(false);
   const editDialog = useDialog({ defaultOpen: false });
   const dateDialog = useDialog({ defaultOpen: false });
   const [startDate, setStartDate] = useState(event.startDate ? parseISO(event.startDate) : undefined);

   const closeDialog = editDialog.close;
   useEffect(() => {
      if (fetcher.data?.ok && fetcher.state === "idle") {
         setOpen(false);
         closeDialog();
      }
   }, [closeDialog, fetcher.data, fetcher.state]);

   return (
      <>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button size="icon">
                  <EllipsisVertical />
                  <span className="sr-only">Åpne meny for arrangement</span>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
               <DropdownMenuItem className="w-full" onClick={editDialog.open}>
                  <Edit className="mr-2" /> Rediger arrangement
               </DropdownMenuItem>
               <DropdownMenuItem className="w-full" onClick={() => setOpen(true)}>
                  <Trash className="mr-2" /> Slett arrangement
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
         <ConfirmDialog
            onClose={() => setOpen(false)}
            open={open}
            text={
               numberOfImages === 0
                  ? "Er du sikker på at du vil slette arrangmentet?"
                  : "Du kan ikke slette arrangementet ettersom det fortsatt finnes bilder..."
            }
            onConfirm={() => {
               fetcher.submit({ intent: "deleteEvent" }, { method: "DELETE" });
            }}
            isLoading={fetcher.state !== "idle"}
            disabled={numberOfImages > 0}
         />
         <Dialog ref={editDialog.dialogRef}>
            <DialogHeading>Rediger arrangement</DialogHeading>
            <fetcher.Form method="PUT">
               <FormProvider
                  errors={fetcher.data && "fieldErrors" in fetcher.data ? fetcher.data.fieldErrors : undefined}
               >
                  <FormItem name="title">
                     <FormLabel>Tittel</FormLabel>
                     <FormControl
                        render={(props) => <Input {...props} defaultValue={event.title} autoComplete="off" />}
                     />
                     <FormMessage />
                  </FormItem>
                  <FormItem name="description">
                     <FormLabel>Beskrivelse</FormLabel>
                     <FormControl
                        render={(props) => <Input {...props} defaultValue={event.description} autoComplete="off" />}
                     />
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
                           <dialog ref={dateDialog.dialogRef} className="bg-background shadow-2xl rounded p-4 border">
                              <div className="flex justify-between items-center">
                                 <Typography variant="h3">Velg dato</Typography>
                                 <Button type="button" variant="ghost" size="icon" onClick={dateDialog.close}>
                                    <X />
                                    <span className="sr-only">Lukk</span>
                                 </Button>
                              </div>
                              <DayPicker
                                 className="m-0 mt-2"
                                 locale={nb}
                                 mode="single"
                                 selected={startDate}
                                 onSelect={(date) => {
                                    dateDialog.close();
                                    setStartDate(date);
                                 }}
                              />
                           </dialog>
                        </div>
                     </FormItem>
                     <FormItem name="startTime" className="w-[100px]">
                        <FormLabel>Starttidspunkt</FormLabel>
                        <FormControl
                           render={(props) => (
                              <Input {...props} defaultValue={event.startTime ?? ""} type="time" autoComplete="off" />
                           )}
                        />
                        <FormMessage />
                     </FormItem>
                  </div>
               </FormProvider>

               <DialogFooter>
                  <Button type="submit" name="intent" value="updateEvent" isLoading={fetcher.state !== "idle"}>
                     Lagre
                  </Button>
                  <Button type="reset" variant="ghost" onClick={editDialog.close}>
                     Avbryt
                  </Button>
               </DialogFooter>
            </fetcher.Form>
         </Dialog>
      </>
   );
};
