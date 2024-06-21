import { useFetcher } from "@remix-run/react";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { Plus, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

import { Button, ButtonResponsive } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
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
import { useDialog } from "~/utils/dialogUtils";

import type { action } from "./route";

export const PollNew = () => {
   const fetcher = useFetcher<typeof action>();
   const newPollDialog = useDialog({ defaultOpen: false });
   const formRef = useRef<HTMLFormElement>(null);
   const [type, setType] = useState("");
   const [selectedDates, setSelectedDates] = useState<Date[]>();
   const [textOptions, setTextOptions] = useState([crypto.randomUUID()]);
   const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
         setType(event.target.value);
      }
   };

   const handleReset = () => {
      setType("");
      setTextOptions([crypto.randomUUID()]);
      setSelectedDates([]);
   };

   const closeDialog = newPollDialog.close;
   useEffect(() => {
      if (fetcher.data?.ok && fetcher.state === "idle") {
         formRef.current?.reset();
         closeDialog();
      }
   }, [closeDialog, fetcher.data, fetcher.state]);

   return (
      <>
         <ButtonResponsive
            onClick={() => newPollDialog.open()}
            variant="outline"
            icon={<Plus />}
            label="Ny avstemningen"
         />
         <Dialog ref={newPollDialog.dialogRef}>
            <fetcher.Form method="POST" onReset={handleReset} ref={formRef}>
               <FormProvider errors={fetcher.data && "errors" in fetcher.data ? fetcher.data.errors : undefined}>
                  <DialogHeading>Ny avstemning</DialogHeading>
                  <div className="space-y-4">
                     <FormItem name="name">
                        <FormLabel>Navn</FormLabel>
                        <FormControl render={(props) => <Input {...props} autoComplete="off" />} />
                        <FormMessage />
                     </FormItem>
                     <FormItem name="type">
                        <FormFieldset>
                           <FormLegend className="mb-2">Velg type</FormLegend>
                           <div className="flex gap-2">
                              <Label className="flex items-center gap-2 cursor-pointer">
                                 <input
                                    onChange={handleTypeChange}
                                    className="size-4"
                                    type="radio"
                                    name="type"
                                    value="text"
                                    checked={type === "text"}
                                 />
                                 Tekst
                              </Label>
                              <Label className="flex items-center gap-2 cursor-pointer">
                                 <input
                                    onChange={handleTypeChange}
                                    className="size-4"
                                    type="radio"
                                    name="type"
                                    value="date"
                                    checked={type === "date"}
                                 />
                                 Dato
                              </Label>
                           </div>
                        </FormFieldset>
                        <FormMessage />
                     </FormItem>
                     {type ? (
                        <>
                           {type === "date" ? (
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
                                       labels={{
                                          labelNext: () => "Gå til neste måned",
                                          labelPrevious: () => "Gå til forrige måned",
                                          labelMonthDropdown: () => "Velg måned",
                                          labelYearDropdown: () => "Velg år",
                                       }}
                                       selected={selectedDates}
                                       onSelect={setSelectedDates}
                                       captionLayout="dropdown-buttons"
                                       fromYear={new Date().getFullYear()}
                                       toYear={new Date().getFullYear() + 5}
                                    />
                                    <FormMessage />
                                 </FormItem>
                              </div>
                           ) : null}
                           {type === "text" ? (
                              <>
                                 <ul className="flex flex-col gap-2" aria-label="Alternativer">
                                    {textOptions.map((id, index) => {
                                       return (
                                          <li key={id} className="flex gap-4">
                                             <FormItem name={`textOption[${index}]`} className="flex-1">
                                                <FormLabel>Alternativ {index + 1}</FormLabel>
                                                <div className="flex gap-2">
                                                   <FormControl
                                                      render={(props) => <Input {...props} autoComplete="off" />}
                                                   />
                                                   <Button
                                                      type="button"
                                                      onClick={() =>
                                                         setTextOptions(textOptions.filter((option) => option !== id))
                                                      }
                                                      size="icon"
                                                      variant="ghost"
                                                      disabled={textOptions.length === 1}
                                                   >
                                                      <Trash />
                                                      <span className="sr-only">Fjern alternativ {index + 1}</span>
                                                   </Button>
                                                </div>
                                                <FormMessage />
                                             </FormItem>
                                          </li>
                                       );
                                    })}
                                 </ul>
                                 <Button
                                    type="button"
                                    onClick={() => setTextOptions([...textOptions, crypto.randomUUID()])}
                                 >
                                    Legg til alternativ
                                 </Button>
                              </>
                           ) : null}
                           <FormItem name="isAnonymous">
                              <div className="flex gap-2 cursor-pointer">
                                 <FormControl
                                    render={(props) => (
                                       <input {...props} className="cursor-pointer size-4" type="checkbox" />
                                    )}
                                 />
                                 <FormLabel className="cursor-pointer">Anonym avstemning</FormLabel>
                              </div>
                           </FormItem>
                           <FormItem name="canAddSuggestions">
                              <div className="flex gap-2 cursor-pointer">
                                 <FormControl
                                    render={(props) => (
                                       <input {...props} className="cursor-pointer size-4" type="checkbox" />
                                    )}
                                 />
                                 <FormLabel className="cursor-pointer">La brukere foreslå andre alternativer</FormLabel>
                              </div>
                           </FormItem>
                           <FormItem name="canSelectMultiple">
                              <div className="flex gap-2 cursor-pointer">
                                 <FormControl
                                    render={(props) => (
                                       <input {...props} className="cursor-pointer size-4" type="checkbox" />
                                    )}
                                 />
                                 <FormLabel className="cursor-pointer">
                                    La brukere stemme på flere alternativer
                                 </FormLabel>
                              </div>
                           </FormItem>
                        </>
                     ) : null}
                  </div>
                  <DialogFooter>
                     <Button type="submit" name="intent" value="newPoll" isLoading={fetcher.state !== "idle"}>
                        Opprett
                     </Button>
                     <Button type="reset" variant="ghost" onClick={() => newPollDialog.close()}>
                        Avbryt
                     </Button>
                  </DialogFooter>
               </FormProvider>
            </fetcher.Form>
         </Dialog>
      </>
   );
};
