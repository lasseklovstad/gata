import { useFetcher } from "@remix-run/react";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

import { PollFormOptions } from "./PollFormOptions";
import type { action } from "./route";

export const PollNew = () => {
   const fetcher = useFetcher<typeof action>();
   const newPollDialog = useDialog({ defaultOpen: false });
   const formRef = useRef<HTMLFormElement>(null);
   const [type, setType] = useState("");
   const [selectedDates, setSelectedDates] = useState<Date[]>([]);
   const [textOptions, setTextOptions] = useState<string[]>([crypto.randomUUID()]);

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
                     {type === "date" || type === "text" ? (
                        <>
                           <PollFormOptions
                              type={type}
                              selectedDates={selectedDates}
                              setSelectedDates={setSelectedDates}
                              setTextOptions={setTextOptions}
                              textOptions={textOptions}
                           />
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
