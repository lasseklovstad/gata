import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { Plus, Trash } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { Button } from "~/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type Props = {
   type: "text" | "date";
   selectedDates: Date[];
   setSelectedDates: (date: Date[]) => void;
   textOptions: string[];
   setTextOptions: (options: string[]) => void;
   existingOptions?: string[];
};

export const PollFormOptions = ({
   type,
   selectedDates,
   setSelectedDates,
   setTextOptions,
   textOptions,
   existingOptions = [],
}: Props) => {
   const currentYear = new Date().getFullYear();
   return (
      <>
         {type === "date" ? (
            <div>
               <FormItem name="dateOption">
                  <Label>Velg datoer for avstemning</Label>
                  {selectedDates.map((selectedDate) => (
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
                     disabled={existingOptions.map((option) => new Date(option))}
                     selected={selectedDates}
                     onSelect={(dates) => setSelectedDates(dates ?? [])}
                     captionLayout="dropdown"
                     startMonth={new Date(currentYear, 0)}
                     endMonth={new Date(currentYear + 5, 0)}
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
                                 <FormControl render={(props) => <Input {...props} autoComplete="off" />} />
                                 <Button
                                    type="button"
                                    onClick={() => setTextOptions(textOptions.filter((option) => option !== id))}
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
                  variant="outline"
                  type="button"
                  onClick={() => setTextOptions([...textOptions, crypto.randomUUID()])}
               >
                  <Plus className="mr-2" />
                  Legg til alternativ
               </Button>
            </>
         ) : null}
      </>
   );
};
