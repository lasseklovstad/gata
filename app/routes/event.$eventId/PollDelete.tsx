import { useFetcher } from "@remix-run/react";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";

import { ConfirmDialog } from "~/components/ConfirmDialog";
import { ButtonResponsive } from "~/components/ui/button";

import type { action } from "./route";

type Props = {
   isActive: boolean;
   isOrganizer: boolean;
   pollId: number;
};

export const PollDelete = ({ pollId, isActive, isOrganizer }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const [open, setOpen] = useState(false);

   useEffect(() => {
      if (fetcher.data?.ok) {
         setOpen(false);
      }
   }, [fetcher.data?.ok]);

   if (!isActive || !isOrganizer) {
      return null;
   }

   return (
      <>
         <ConfirmDialog
            onClose={() => setOpen(false)}
            open={open}
            text="Er du sikker på at du vil slette avstemningen?"
            onConfirm={() => {
               fetcher.submit({ intent: "deletePoll", pollId }, { method: "DELETE" });
            }}
         />
         <ButtonResponsive
            type="button"
            onClick={() => setOpen(true)}
            variant="destructive"
            icon={<Trash />}
            label="Slett avstemningen"
         />
      </>
   );
};
