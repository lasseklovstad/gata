import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useFetcher } from "@remix-run/react";
import { ChevronDown, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "~/components/ui/button";
import { FormControl, FormDescription, FormItem, FormLabel } from "~/components/ui/form";
import type { IExternalUser, IGataUser } from "~/types/GataUser.type";
import { cn } from "~/utils";

import { ExternalUserIcon } from "./ExternalUserIcon";
import { memberIntent } from "../intent";

type LinkExternalUserToGataUserSelectProps = {
   user: IGataUser;
   notMemberUsers: IExternalUser[];
};

export const LinkExternalUserToGataUserSelect = ({
   user: { externalUserProviders, id },
   notMemberUsers,
}: LinkExternalUserToGataUserSelectProps) => {
   const fetcher = useFetcher();
   const [query, setQuery] = useState("");
   const inputRef = useRef<HTMLInputElement>(null);

   const menuItems = [...externalUserProviders, ...notMemberUsers];

   const options = menuItems.map((user) => ({
      label: user.email,
      value: user.id,
      icon: <ExternalUserIcon user={user} />,
      isFixed: !!user.primary,
   }));

   const selectedOptions = options.filter((option) => !!externalUserProviders.find((user) => user.id === option.value));

   const filteredPeople =
      query === ""
         ? options
         : options.filter((person) => {
              return person.label.toLowerCase().includes(query.toLowerCase());
           });

   const handleChange = (newSelectedOptions: typeof options | null) => {
      if (!newSelectedOptions) return;
      const userIds = newSelectedOptions.map((o) => o.value);
      const formData = new FormData();
      formData.set("userId", id);
      formData.set("intent", memberIntent.updateLinkedUsers);
      userIds.forEach((userId) => formData.append("externalUserId", userId));
      fetcher.submit(formData, { method: "PUT" });
      setQuery("");
      inputRef.current?.blur();
   };
   return (
      <>
         <FormItem name="externalUserId">
            <FormLabel>Epost tilknytninger</FormLabel>
            <FormControl
               render={({ id: inputId }) => (
                  <Combobox multiple value={selectedOptions} onChange={handleChange} onClose={() => setQuery("")}>
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
                           value={query}
                           placeholder="Søk epost"
                           onChange={(event) => setQuery(event.target.value)}
                           ref={inputRef}
                        />
                        <ComboboxButton className="absolute inset-y-0 right-0 px-2.5">
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
