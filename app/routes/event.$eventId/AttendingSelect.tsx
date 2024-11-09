import { Form, useSubmit } from "@remix-run/react";
import { Bell } from "lucide-react";
import { useId, useRef } from "react";

import type { EventParticipant } from "~/.server/db/gataEvent";
import type { User } from "~/.server/db/user";
import { AvatarUser } from "~/components/AvatarUser";
import { AvatarUserList } from "~/components/AvatarUserList";
import { Button } from "~/components/ui/button";
import { Dialog, DialogCloseButton, DialogHeading } from "~/components/ui/dialog";
import { FormControl, FormDescription, FormItem, FormLabel } from "~/components/ui/form";
import { Label } from "~/components/ui/label";
import { NativeSelect } from "~/components/ui/native-select";
import { Switch } from "~/components/ui/switch";
import { useDialog } from "~/utils/dialogUtils";

type Props = {
   eventParticipants: EventParticipant[];
   loggedInUser: User;
};

export const AttendingSelect = ({ eventParticipants, loggedInUser }: Props) => {
   const dialog = useDialog({ defaultOpen: false });
   const selectId = useId();
   const $form = useRef<HTMLFormElement>(null);
   const isLoggedInUserParticipating = eventParticipants.find((participant) => participant.userId === loggedInUser.id);
   const usersAttending = eventParticipants
      .filter((participant) => participant.isParticipating)
      .map((participant) => participant.user);
   return (
      <Form method="PUT" ref={$form}>
         <div className="flex flex-col gap-2">
            <Label htmlFor={selectId}>Si ifra om du kommer</Label>
            <div className="flex gap-4 items-center">
               <NativeSelect
                  id={selectId}
                  className="w-36"
                  value={
                     isLoggedInUserParticipating?.isParticipating === null ||
                     isLoggedInUserParticipating?.isParticipating === undefined
                        ? ""
                        : isLoggedInUserParticipating.isParticipating
                          ? "going"
                          : "notGoing"
                  }
                  name="status"
                  onChange={() => $form.current?.requestSubmit()}
               >
                  <option value="">Ikke valgt</option>
                  <option value="going">Skal</option>
                  <option value="notGoing">Kan ikke</option>
               </NativeSelect>

               {usersAttending.length ? (
                  <Button
                     variant={"outline"}
                     className="flex gap-2"
                     aria-label={`Se deltakere som deltar (${usersAttending.length})`}
                     onClick={dialog.open}
                     type="button"
                  >
                     <AvatarUserList aria-label="Personer som deltar" className="justify-end" users={usersAttending} />
                     {usersAttending.length}
                  </Button>
               ) : null}
               <Dialog ref={dialog.dialogRef}>
                  <DialogHeading>Deltakere som deltar ({usersAttending.length})</DialogHeading>
                  <DialogCloseButton onClose={dialog.close} />
                  <ul className="flex flex-col gap-2">
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
            <FormItem name="subscribed" className="p-2 flex justify-between items-center w-fit gap-2">
               <FormLabel className="flex gap-2 items-center">
                  <Bell /> Notifikasjoner
               </FormLabel>
               <FormControl
                  render={(props) => (
                     <Switch
                        {...props}
                        defaultChecked={!isLoggedInUserParticipating?.unsubscribed}
                        onCheckedChange={() => $form.current?.requestSubmit()}
                     />
                  )}
               />
            </FormItem>
            <input hidden readOnly name="intent" value="updateParticipating" />
         </div>
      </Form>
   );
};
