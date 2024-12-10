import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { useFetcher } from "react-router";

import type { User } from "~/.server/db/user";
import { FormControl, FormDescription, FormItem, FormLabel } from "~/components/ui/form";

import { ExternalUserIcon } from "./ExternalUserIcon";
import { memberIntent } from "../intent";
import type { action } from "../route";

type Props = {
   user: User;
};

export const SelectPrimaryEmail = ({ user }: Props) => {
   const fetcher = useFetcher<typeof action>();

   const options = user.externalUsers.map((user) => ({
      label: user.email,
      value: user.id,
      icon: <ExternalUserIcon user={user} />,
   }));

   const selectedOption = options.find((option) => user.primaryExternalUserId === option.value);

   return (
      <>
         <FormItem name="primaryUserEmail1">
            <FormLabel>Primær epost</FormLabel>
            <FormControl
               render={({ id: buttonId, ...props }) => (
                  <Listbox
                     name={props.name}
                     value={selectedOption?.value}
                     onChange={(option) => {
                        void fetcher.submit(
                           { primaryUserEmail: option, intent: memberIntent.updatePrimaryUserEmail },
                           { method: "POST" }
                        );
                     }}
                  >
                     <ListboxButton
                        id={buttonId}
                        className="relative border outline-none rounded bg-background flex gap-2 py-2 px-1 w-full data-[focus]:ring-2 data-[focus]:ring-ring data-[focus]:ring-offset-2"
                     >
                        {selectedOption?.icon} <span className="mr-2 overflow-hidden">{selectedOption?.label}</span>
                        <ChevronDown
                           aria-hidden="true"
                           className="absolute bg-background h-6 w-6 right-2 top-2 pointer-events-none"
                        />
                     </ListboxButton>
                     <ListboxOptions
                        anchor="bottom"
                        className="w-[var(--button-width)] bg-background border p-1 rounded"
                     >
                        {options.map((person) => (
                           <ListboxOption
                              key={person.value}
                              value={person.value}
                              className="flex gap-2 cursor-default data-[selected]:bg-blue-200 data-[focus]:bg-blue-100 py-1 px-2"
                           >
                              {person.icon} {person.label}
                           </ListboxOption>
                        ))}
                     </ListboxOptions>
                  </Listbox>
               )}
            />
            <FormDescription>Denne eposten blir brukt til å sende ut informasjon</FormDescription>
         </FormItem>
      </>
   );
};
