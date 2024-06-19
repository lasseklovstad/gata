import { useSubmit } from "@remix-run/react";
import { useId } from "react";
import type { EventParticipant } from "~/.server/db/gataEvent";
import type { User } from "~/.server/db/user";
import { AvatarUserList } from "~/components/AvatarUserList";
import { Label } from "~/components/ui/label";
import { NativeSelect } from "~/components/ui/native-select";

type Props = {
   eventParticipants: EventParticipant[];
   loggedInUser: User;
};

export const AttendingSelect = ({ eventParticipants, loggedInUser }: Props) => {
   const submit = useSubmit();
   const selectId = useId();
   const isLoggedInUserParticipating = eventParticipants.find((participant) => participant.userId === loggedInUser.id);
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
               <AvatarUserList
                  aria-label="Personer som deltar"
                  className="justify-end"
                  users={eventParticipants
                     .filter((participant) => participant.isParticipating)
                     .map((participant) => participant.user)}
               />
            </div>
         </div>
      </div>
   );
};
