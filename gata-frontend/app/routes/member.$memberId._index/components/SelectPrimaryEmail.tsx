import { useFetcher } from "@remix-run/react";
import Select from "react-select";

import { FormControl, FormDescription, FormItem, FormLabel } from "~/components/ui/form";
import { getSelectDefaultProps } from "~/utils/selectUtils";

import { ExternalUserIcon } from "./ExternalUserIcon";
import type { IGataUser } from "../../../types/GataUser.type";
import { memberIntent } from "../intent";

type Props = {
   user: IGataUser;
};

export const SelectPrimaryEmail = ({ user }: Props) => {
   const fetcher = useFetcher();

   const options = user.externalUserProviders.map((user) => ({
      label: user.email,
      value: user.id,
      icon: <ExternalUserIcon user={user} />,
   }));

   const selectedOption = options.filter((option) => user.primaryUser.id === option.value);

   return (
      <FormItem name="primaryUserEmail">
         <FormLabel>Primær epost</FormLabel>
         <FormControl
            render={({ id: inputId, ...props }) => (
               <Select
                  {...props}
                  {...getSelectDefaultProps<false>()}
                  inputId={inputId}
                  value={selectedOption}
                  options={options}
                  isMulti={false}
                  onChange={(option) => {
                     if (!option?.value) return;
                     fetcher.submit(
                        { primaryUserEmail: option.value, intent: memberIntent.updatePrimaryUserEmail },
                        { method: "POST" }
                     );
                  }}
               />
            )}
         />
         <FormDescription>Denne eposten blir brukt til å sende ut informasjon</FormDescription>
      </FormItem>
   );
};
