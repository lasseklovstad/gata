import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Poll } from "~/.server/db/gataEvent";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import { FormProvider } from "~/components/ui/form";
import { useDialog } from "~/utils/dialogUtils";

import { PollFormOptions } from "./PollFormOptions";
import type { action } from "./route";

type Props = {
   poll: SerializeFrom<Poll["poll"]>;
};

export const PollAddOption = ({ poll }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const dialog = useDialog({ defaultOpen: false });
   const formRef = useRef<HTMLFormElement>(null);
   const [selectedDates, setSelectedDates] = useState<Date[]>([]);
   const [textOptions, setTextOptions] = useState<string[]>([crypto.randomUUID()]);

   const handleReset = () => {
      setTextOptions([crypto.randomUUID()]);
      setSelectedDates([]);
   };

   const closeDialog = dialog.close;
   useEffect(() => {
      if (fetcher.data?.ok && fetcher.state === "idle") {
         formRef.current?.reset();
         closeDialog();
      }
   }, [closeDialog, fetcher.data, fetcher.state]);

   return (
      <>
         <Button variant="outline" onClick={dialog.open}>
            <Plus className="mr-2" />
            Legg til alternativ
         </Button>
         <Dialog ref={dialog.dialogRef}>
            <fetcher.Form method="POST" onReset={handleReset} ref={formRef}>
               <FormProvider errors={fetcher.data && "errors" in fetcher.data ? fetcher.data.errors : undefined}>
                  <DialogHeading>Legg til alternativ</DialogHeading>
                  <input hidden readOnly value={poll.id} name="pollId" />
                  <input hidden readOnly value={poll.type} name="type" />
                  <PollFormOptions
                     type={poll.type}
                     selectedDates={selectedDates}
                     setSelectedDates={setSelectedDates}
                     setTextOptions={setTextOptions}
                     textOptions={textOptions}
                     existingOptions={poll.pollOptions.map((option) => option.textOption)}
                  />
                  <DialogFooter>
                     <Button type="submit" name="intent" value="addPollOptions" isLoading={fetcher.state !== "idle"}>
                        Legg til
                     </Button>
                     <Button type="reset" variant="ghost" onClick={dialog.close}>
                        Avbryt
                     </Button>
                  </DialogFooter>
               </FormProvider>
            </fetcher.Form>
         </Dialog>
      </>
   );
};
