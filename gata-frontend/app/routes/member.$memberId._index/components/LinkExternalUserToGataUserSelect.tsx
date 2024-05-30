import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import { ChevronDown, X } from "lucide-react";
import { useRef, useState } from "react";

import type { ExternalUser } from "db/schema";
import type { User } from "~/.server/db/user";
import { Button } from "~/components/ui/button";
import { FormControl, FormDescription, FormItem, FormLabel } from "~/components/ui/form";
import { cn } from "~/utils";

import { ExternalUserIcon } from "./ExternalUserIcon";
import { memberIntent } from "../intent";

type LinkExternalUserToGataUserSelectProps = {
   user: User;
   notMemberUsers: ExternalUser[];
};

export const LinkExternalUserToGataUserSelect = ({
   user: { externalUsers, id },
   notMemberUsers,
}: LinkExternalUserToGataUserSelectProps) => {
   const fetcher = useFetcher();
   const [query, setQuery] = useState("");
   const inputRef = useRef<HTMLInputElement>(null);
   const buttonRef = useRef<HTMLButtonElement>(null);

   const options = notMemberUsers.map((user) => ({
      label: user.email ?? "",
      value: user.id,
      icon: <ExternalUserIcon user={user} />,
      isFixed: !!user.primaryUser,
   }));

   const selectedOptions = externalUsers.map((user) => ({
      label: user.email ?? "",
      value: user.id,
      icon: <ExternalUserIcon user={user} />,
      isFixed: !!user.primaryUser,
   }));

   const filteredPeople =
      query === ""
         ? options
         : options.filter((person) => {
              return person.label.toLowerCase().includes(query.toLowerCase());
           });

   type Option = (typeof options)[number];

   const handleChange = (newSelectedOptions: typeof options | null) => {
      if (!newSelectedOptions) return;
      const userIds = newSelectedOptions.map((o) => o.value);
      const formData = new FormData();
      formData.set("intent", memberIntent.updateLinkedUsers);
      userIds.forEach((userId) => formData.append("externalUserId", userId));
      fetcher.submit(formData, { method: "PUT" });
      setQuery("");
   };
   return (
      <>
         <FormItem name="externalUserId">
            <FormLabel>Epost tilknytninger</FormLabel>
            <FormControl
               render={({ id: inputId }) => (
                  <Combobox
                     onChange={(option: Option | null) => {
                        if (!option) return;
                        handleChange([...selectedOptions, option]);
                     }}
                     onClose={() => setQuery("")}
                  >
                     {selectedOptions.length > 0 && (
                        <ul className="flex gap-2 flex-wrap">
                           {selectedOptions.map((person) => (
                              <li key={person.value} className="flex gap-2 items-center bg-blue-100 p-0.5 rounded">
                                 {person.icon} {person.label}
                                 {!person.isFixed ? (
                                    <Button
                                       size="icon"
                                       variant="ghost"
                                       className="size-6"
                                       onClick={() => {
                                          const newOptions = selectedOptions.filter(
                                             (option) => option.value !== person.value
                                          );
                                          handleChange(newOptions);
                                       }}
                                    >
                                       <X aria-hidden="true" />
                                       <span className="sr-only">Fjern {person.label}</span>
                                    </Button>
                                 ) : null}
                              </li>
                           ))}
                        </ul>
                     )}

                     <div className="relative">
                        <ComboboxInput
                           className="border outline-none w-full py-2 px-1 bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded"
                           id={inputId}
                           placeholder="Søk epost"
                           onChange={(event) => setQuery(event.target.value)}
                           value={query}
                           ref={inputRef}
                        />
                        <ComboboxButton ref={buttonRef} className="absolute inset-y-0 right-0 px-2.5">
                           <ChevronDown className="size-6" />
                        </ComboboxButton>
                     </div>

                     <ComboboxOptions
                        anchor="bottom"
                        className={cn("empty:hidden w-full bg-background border rounded p-1", "w-[var(--input-width)]")}
                     >
                        {filteredPeople.map((person) => (
                           <ComboboxOption
                              key={person.value}
                              value={person}
                              className="data-[focus]:bg-blue-100 data-[selected]:hidden p-2 flex gap-2 items-center"
                           >
                              {person.icon} {person.label}
                           </ComboboxOption>
                        ))}
                     </ComboboxOptions>
                  </Combobox>
               )}
            />
            <FormDescription>
               Hvis en bruker har logget inn med forskjellige tjenester, kan disse kontoene knyttes sammen her!
            </FormDescription>
         </FormItem>
      </>
   );
};
