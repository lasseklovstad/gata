import { formatDate, isValid } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { useFetcher } from "react-router";

import type { User } from "~/.server/db/user";
import type { TimeLineEvent } from "~/.server/db/userTimelineEvent";
import { MapPicker } from "~/components/MapPicker";
import { Button } from "~/components/ui/button";
import { DialogFooter, DialogHeading } from "~/components/ui/dialog";
import {
   FormControl,
   FormFieldset,
   FormItem,
   FormLabel,
   FormLegend,
   FormMessage,
   FormProvider,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { NativeSelect } from "~/components/ui/native-select";
import { Textarea } from "~/components/ui/textarea";
import { Typography } from "~/components/ui/typography";
import { dayPickerLabels } from "~/utils/date.utils";
import { useDialog } from "~/utils/dialogUtils";

import type { action } from "./route";

type Props = {
   users: User[];
   event?: TimeLineEvent;
   onSuccess?: () => void;
   onClose?: () => void;
};

const currentYear = new Date().getFullYear();

export const EventForm = ({ users, event, onSuccess, onClose }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const formRef = useRef<HTMLFormElement>(null);
   const dateDialog = useDialog({ defaultOpen: false });
   const dateDialogTitleId = useId();

   const [date, setDate] = useState<Date | undefined>(event?.eventDate ? new Date(event.eventDate) : undefined);
   const [rawDate, setRawDate] = useState("");
   const [type, setType] = useState(event?.eventType || "");
   const [longitude, setLongitude] = useState<number | undefined>(event?.longitude ?? undefined);
   const [latitude, setLatitude] = useState<number | undefined>(event?.latitude ?? undefined);

   const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
         setType(event.target.value);
      }
   };

   const handleReset = () => {
      if (!event) {
         setType("");
         setDate(undefined);
         setRawDate("");
         setLongitude(undefined);
         setLatitude(undefined);
      }
   };

   useEffect(() => {
      if (fetcher.data?.ok && fetcher.state === "idle") {
         fetcher.reset({ reason: "Submit finished" });
         formRef.current?.reset();
         if (onSuccess) {
            onSuccess();
         }
      }
   }, [fetcher.data, fetcher.state, onSuccess]);

   return (
      <fetcher.Form method="POST" ref={formRef} onReset={handleReset}>
         <FormProvider errors={fetcher.data && "errors" in fetcher.data ? fetcher.data.errors : undefined}>
            <DialogHeading>{event ? "Rediger hendelse" : "Ny hendelse"}</DialogHeading>
            <div className="space-y-4">
               <FormItem name="user">
                  <FormLabel>Medlem</FormLabel>
                  <FormControl
                     render={(props) => (
                        <NativeSelect
                           {...props}
                           className="w-fit min-w-60"
                           defaultValue={event?.userId}
                           disabled={!!event}
                        >
                           {users.map((user) => {
                              return (
                                 <option value={user.id} key={user.id}>
                                    {user.name}
                                 </option>
                              );
                           })}
                        </NativeSelect>
                     )}
                  />
               </FormItem>
               <div className="grid grid-cols-2 gap-4">
                  <FormItem name="date">
                     <Label>Dato</Label>
                     <div className="flex gap-2 items-center relative">
                        <Input
                           name="date"
                           type="date"
                           value={rawDate || (date ? formatDate(date, "yyyy-MM-dd") : "")}
                           onChange={(e) => {
                              if (e.target.valueAsDate && isValid(e.target.valueAsDate)) {
                                 setDate(e.target.valueAsDate);
                                 setRawDate("");
                              } else {
                                 setRawDate(e.target.value);
                              }
                           }}
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
                              selected={date}
                              onSelect={(date) => {
                                 dateDialog.close();
                                 setDate(date);
                              }}
                              captionLayout="dropdown"
                              startMonth={new Date(1980, 0)}
                              endMonth={new Date(currentYear + 1, 0)}
                           />
                        </dialog>
                     </div>
                     <FormMessage />
                  </FormItem>
               </div>
               <FormItem name="type">
                  <FormFieldset>
                     <FormLegend className="mb-2">Velg type</FormLegend>
                     <div className="flex gap-2">
                        <Label className="flex items-center gap-2 cursor-pointer">
                           <input
                              className="size-4"
                              type="radio"
                              name="type"
                              value="civil-status"
                              onChange={handleTypeChange}
                              checked={type === "civil-status"}
                           />
                           Sivilstatus
                        </Label>
                        <Label className="flex items-center gap-2 cursor-pointer">
                           <input
                              className="size-4"
                              type="radio"
                              name="type"
                              value="home"
                              onChange={handleTypeChange}
                              checked={type === "home"}
                           />
                           Bosted
                        </Label>
                        <Label className="flex items-center gap-2 cursor-pointer">
                           <input
                              className="size-4"
                              type="radio"
                              name="type"
                              value="work"
                              onChange={handleTypeChange}
                              checked={type === "work"}
                           />
                           Studie/Jobb
                        </Label>
                     </div>
                  </FormFieldset>
                  <FormMessage />
               </FormItem>

               {type === "home" ? (
                  <div className="space-y-4">
                     <FormItem name="place">
                        <FormLabel>Sted</FormLabel>
                        <FormControl
                           render={(props) => <Input {...props} autoComplete="off" defaultValue={event?.place ?? ""} />}
                        />
                        <FormMessage />
                     </FormItem>
                     <div>
                        <Label className="block mb-2">Velg posisjon</Label>
                        <MapPicker
                           longitude={longitude}
                           latitude={latitude}
                           onCoordinatesChange={(lng, lat) => {
                              setLongitude(lng);
                              setLatitude(lat);
                           }}
                        />
                     </div>
                     <div className="flex gap-2">
                        <FormItem name="longitude">
                           <FormLabel>Lengdegrad</FormLabel>
                           <FormControl
                              render={(props) => (
                                 <Input
                                    {...props}
                                    type="number"
                                    step={0.0001}
                                    autoComplete="off"
                                    value={longitude ?? ""}
                                    onChange={(e) => setLongitude(e.target.valueAsNumber || undefined)}
                                 />
                              )}
                           />
                           <FormMessage />
                        </FormItem>
                        <FormItem name="latitude">
                           <FormLabel>Breddegrad</FormLabel>
                           <FormControl
                              render={(props) => (
                                 <Input
                                    {...props}
                                    type="number"
                                    step={0.0001}
                                    autoComplete="off"
                                    value={latitude ?? ""}
                                    onChange={(e) => setLatitude(e.target.valueAsNumber || undefined)}
                                 />
                              )}
                           />
                           <FormMessage />
                        </FormItem>
                     </div>
                  </div>
               ) : null}

               <FormItem name="description">
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl
                     render={(props) => <Textarea {...props} autoComplete="off" defaultValue={event?.description} />}
                  />
                  <FormMessage />
               </FormItem>
            </div>
            <DialogFooter>
               {event ? <input type="hidden" name="eventId" value={event.id} /> : null}
               <Button
                  type="submit"
                  name="intent"
                  value={event ? "updateEvent" : "newEvent"}
                  isLoading={fetcher.state !== "idle"}
               >
                  {event ? "Oppdater" : "Opprett"}
               </Button>
               <Button type="reset" variant="ghost" onClick={onClose}>
                  Avbryt
               </Button>
            </DialogFooter>
         </FormProvider>
      </fetcher.Form>
   );
};
