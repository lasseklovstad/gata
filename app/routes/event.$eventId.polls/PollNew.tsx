import { useFetcher } from "@remix-run/react";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";

import { Button, ButtonResponsive } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useDialog } from "~/utils/dialogUtils";

import type { action } from "./route";

export const PollNew = () => {
   const fetcher = useFetcher<typeof action>();
   const newPollDialog = useDialog({ defaultOpen: false });
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

   useEffect(() => {
      if (fetcher.data?.ok && fetcher.state === "idle") {
         newPollDialog.close();
      }
   }, [fetcher.data, fetcher.state, newPollDialog]);

   return (
      <>
         <ButtonResponsive
            onClick={() => newPollDialog.open()}
            variant="outline"
            icon={<Plus />}
            label="Ny avstemningen"
         />
         <Dialog ref={newPollDialog.dialogRef}>
            <fetcher.Form method="POST" onReset={handleReset}>
               <FormProvider
                  errors={
                     fetcher.data && fetcher.data.ok === false && "fieldErrors" in fetcher.data
                        ? fetcher.data.fieldErrors
                        : undefined
                  }
               >
                  <DialogHeading>Ny avstemning</DialogHeading>
                  <div className="space-y-4">
                     <FormItem name="name">
                        <FormLabel>Navn</FormLabel>
                        <FormControl render={(props) => <Input {...props} autoComplete="off" />} />
                        <FormMessage />
                     </FormItem>
                     <FormItem name="type">
                        <fieldset>
                           <legend className="mb-2">Velg type</legend>
                           <div className="flex gap-2">
                              <Label className="flex items-center gap-2 cursor-pointer">
                                 <input
                                    onChange={handleTypeChange}
                                    className="size-4"
                                    type="radio"
                                    name="type"
                                    value="text"
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
                                 />
                                 Dato
                              </Label>
                           </div>
                        </fieldset>
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
                                       selected={selectedDates}
                                       onSelect={setSelectedDates}
                                    />
                                    <FormMessage />
                                 </FormItem>
                              </div>
                           ) : null}
                           {type === "text" ? (
                              <>
                                 <ul className="flex flex-col gap-2">
                                    {textOptions.map((id, index) => {
                                       return (
                                          <li key={id} className="flex gap-4 items-end">
                                             <FormItem name="textOption" className="flex-1">
                                                <FormLabel>Alternativ {index + 1}</FormLabel>
                                                <FormControl
                                                   render={(props) => <Input {...props} autoComplete="off" />}
                                                />
                                                <FormMessage />
                                             </FormItem>
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
