import { useSubmit } from "@remix-run/react";
import { useId } from "react";

import type { EventParticipant } from "~/.server/db/gataEvent";
import type { User } from "~/.server/db/user";
import { AvatarUser } from "~/components/AvatarUser";
import { AvatarUserList } from "~/components/AvatarUserList";
import { Button } from "~/components/ui/button";
import { Dialog, DialogCloseButton, DialogHeading } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { NativeSelect } from "~/components/ui/native-select";
import { useDialog } from "~/utils/dialogUtils";

type Props = {
   eventParticipants: EventParticipant[];
   loggedInUser: User;
};

export const AttendingSelect = ({ eventParticipants, loggedInUser }: Props) => {
   const dialog = useDialog({ defaultOpen: false });
   const submit = useSubmit();
   const selectId = useId();
   const isLoggedInUserParticipating = eventParticipants.find((participant) => participant.userId === loggedInUser.id);
   const usersAttending = eventParticipants
      .filter((participant) => participant.isParticipating)
      .map((participant) => participant.user);
   return (
      <div>
         <div className="flex flex-col gap-2">
            <Label htmlFor={selectId}>Si ifra om du kommer</Label>
            <div className="flex gap-4 items-center">
               <NativeSelect
                  id={selectId}
                  className="w-36"
                  value={
                     isLoggedInUserParticipating === undefined
                        ? ""
                        : isLoggedInUserParticipating.isParticipating
                          ? "going"
                          : "notGoing"
                  }
                  onChange={(event) =>
                     submit({ intent: "updateParticipating", status: event.target.value }, { method: "PUT" })
                  }
               >
                  <option value="" disabled>
                     Ikke valgt
                  </option>
                  <option value="going">Skal</option>
                  <option value="notGoing">Kan ikke</option>
               </NativeSelect>
               {usersAttending.length ? (
                  <Button
                     variant={"outline"}
                     className="flex gap-2"
                     aria-label={`Se deltakere som deltar (${usersAttending.length})`}
                     onClick={dialog.open}
                  >
                     <AvatarUserList aria-label="Personer som deltar" className="justify-end" users={usersAttending} />
                     {usersAttending.length}
                  </Button>
               ) : null}
               <Dialog ref={dialog.dialogRef}>
                  <DialogHeading>Deltakere som deltar</DialogHeading>
                  <DialogCloseButton onClose={dialog.close} />
                  <ul>
                     {usersAttending.map((user) => {
                        return (
                           <li key={user.id} className="flex gap-2 items-center">
                              <AvatarUser user={user} />
                              {user.name}
                           </li>
                        );
                     })}
                  </ul>
               </Dialog>
            </div>
         </div>
      </div>
   );
};
