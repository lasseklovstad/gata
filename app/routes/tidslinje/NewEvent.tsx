import { Plus } from "lucide-react";

import type { User } from "~/.server/db/user";
import { ButtonResponsive } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { useDialog } from "~/utils/dialogUtils";

import { EventForm } from "./EventForm";

type Props = {
   users: User[];
};

export const NewEvent = ({ users }: Props) => {
   const dialog = useDialog({ defaultOpen: false });

   return (
      <>
         <ButtonResponsive onClick={() => dialog.open()} variant="outline" icon={<Plus />} label="Ny hendelse" />
         <Dialog ref={dialog.dialogRef} className="max-w-4xl">
            <EventForm users={users} onClose={() => dialog.close()} />
         </Dialog>
      </>
   );
};
