import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Edit, EllipsisVertical, Trash } from "lucide-react";
import { useEffect, useState } from "react";

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
import { FormProvider } from "~/components/ui/form";
import { useDialog } from "~/utils/dialogUtils";

import { EventForm } from "./EventForm";
import type { action } from "./route";

type Props = {
   event: SerializeFrom<GataEvent>;
   numberOfImages: number;
};

export const EventMenu = ({ event, numberOfImages }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const [open, setOpen] = useState(false);
   const editDialog = useDialog({ defaultOpen: false });

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
                  <EventForm event={event} />
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
