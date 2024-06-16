import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Edit, EllipsisVertical, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import type { Poll } from "~/.server/db/gataEvent";
import { ConfirmDialog } from "~/components/ConfirmDialog";
import { Button } from "~/components/ui/button";
import { Dialog, DialogFooter, DialogHeading } from "~/components/ui/dialog";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { FormItem, FormLabel, FormControl, FormMessage, FormProvider } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useDialog } from "~/utils/dialogUtils";

import type { action } from "./route";

type Props = {
   poll: SerializeFrom<Poll["poll"]>;
};

export const PollMenu = ({ poll }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const [open, setOpen] = useState(false);
   const editDialog = useDialog({ defaultOpen: false });

   useEffect(() => {
      if (fetcher.data?.ok && fetcher.state === "idle") {
         setOpen(false);
         editDialog.close();
      }
   }, [editDialog, fetcher.data, fetcher.state]);

   return (
      <>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="outline" size="icon">
                  <EllipsisVertical />
                  <span className="sr-only">Åpne meny for avstemning {poll.name}</span>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
               <DropdownMenuItem className="w-full" onClick={editDialog.open}>
                  <Edit className="mr-2" /> Rediger avstemningen
               </DropdownMenuItem>
               <DropdownMenuItem className="w-full" onClick={() => setOpen(true)}>
                  <Trash className="mr-2" /> Slett avstemningen
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
         <ConfirmDialog
            onClose={() => setOpen(false)}
            open={open}
            text="Er du sikker på at du vil slette avstemningen?"
            onConfirm={() => {
               fetcher.submit({ intent: "deletePoll", pollId: poll.id }, { method: "DELETE" });
            }}
            isLoading={fetcher.state !== "idle"}
         />
         <Dialog ref={editDialog.dialogRef}>
            <DialogHeading>Rediger avstemning</DialogHeading>
            <fetcher.Form method="PUT">
               <FormProvider
                  errors={
                     fetcher.data && fetcher.data.ok === false && "fieldErrors" in fetcher.data
                        ? fetcher.data.fieldErrors
                        : undefined
                  }
               >
                  <input hidden readOnly value={poll.id} name="pollId" />
                  <FormItem name="name">
                     <FormLabel>Navn</FormLabel>
                     <FormControl
                        render={(props) => (
                           <Input {...props} readOnly={!poll.isActive} defaultValue={poll.name} autoComplete="off" />
                        )}
                     />
                     <FormMessage />
                  </FormItem>
                  <FormItem name="canAddSuggestions">
                     <div className="flex gap-2 cursor-pointer">
                        <FormControl
                           render={(props) => (
                              <input
                                 {...props}
                                 defaultChecked={poll.canAddSuggestions}
                                 className="cursor-pointer size-4"
                                 type="checkbox"
                              />
                           )}
                        />
                        <FormLabel className="cursor-pointer">La brukere foreslå andre alternativer</FormLabel>
                     </div>
                  </FormItem>
                  <FormItem name="isFinished">
                     <div className="flex gap-2 cursor-pointer">
                        <FormControl
                           render={(props) => (
                              <input
                                 {...props}
                                 defaultChecked={!poll.isActive}
                                 className="cursor-pointer size-4"
                                 type="checkbox"
                              />
                           )}
                        />
                        <FormLabel className="cursor-pointer">Avslutt avstemning</FormLabel>
                     </div>
                  </FormItem>
               </FormProvider>

               <DialogFooter>
                  <Button type="submit" name="intent" value="updatePoll" isLoading={fetcher.state !== "idle"}>
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
