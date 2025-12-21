import { Pencil } from "lucide-react";
import { useState } from "react";

import type { User } from "~/.server/db/user";
import type { TimeLineEvent } from "~/.server/db/userTimelineEvent";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { useDialog } from "~/utils/dialogUtils";

import { EventForm } from "./EventForm";

type Props = {
   event: TimeLineEvent;
   users: User[];
};

export const EditEvent = ({ event, users }: Props) => {
   const dialog = useDialog({ defaultOpen: false });

   return (
      <>
         <Button variant="secondary" size="sm" onClick={() => dialog.open()}>
            <Pencil className="size-4 mr-1" />
            Rediger
         </Button>
         <Dialog ref={dialog.dialogRef} className="max-w-4xl">
            <EventForm users={users} event={event} onSuccess={() => dialog.close()} onClose={() => dialog.close()} />
         </Dialog>
      </>
   );
};
