import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { useSubmit } from "@remix-run/react";
import { Check, ChevronDown } from "lucide-react";

import type { User } from "~/.server/db/user";

type Props = {
   users: User[];
   organizers: User[];
};

export const EventOrganizers = ({ users, organizers }: Props) => {
   const submit = useSubmit();
   return (
      <Listbox
         multiple
         value={organizers.map((user) => user.id)}
         onChange={(organizers) => {
            const formData = new FormData();
            organizers.forEach((userId) => formData.append("organizers", userId));
            formData.set("intent", "updateOrganizers");
            submit(formData, { method: "PUT" });
         }}
      >
         <ListboxButton className="border items-center outline-none rounded bg-background flex gap-2 py-2 px-2 data-[focus]:ring-2 data-[focus]:ring-ring data-[focus]:ring-offset-2">
            Velg arrangører
            <ChevronDown aria-hidden="true" className="bg-background size-6 pointer-events-none" />
         </ListboxButton>
         <ListboxOptions anchor="bottom start" className="w-fit bg-background border p-1 rounded fixed z-50">
            {users.map((user) => {
               const isSelected = !!organizers.find((organizer) => organizer.id === user.id);
               return (
                  <ListboxOption
                     key={user.id}
                     value={user.id}
                     disabled={organizers.length === 1 && isSelected}
                     className="cursor-default data-[selected]:bg-blue-200 data-[focus]:bg-blue-100 py-1 px-2 flex gap-2"
                  >
                     {isSelected ? <Check /> : null} {user.name}
                  </ListboxOption>
               );
            })}
         </ListboxOptions>
      </Listbox>
   );
};
