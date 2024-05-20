import { useFetcher } from "@remix-run/react";

import { FormControl, FormDescription, FormItem, FormLabel } from "~/components/ui/form";
import { Select } from "~/components/ui/select";

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
      user: user,
   }));

   return (
      <FormItem name="primaryUserEmail">
         <FormLabel>Primær epost</FormLabel>
         <FormControl
            render={(props) => (
               <Select
                  {...props}
                  value={user.primaryUser.id}
                  onChange={(event) => {
                     fetcher.submit(
                        { primaryUserEmail: event.target.value, intent: memberIntent.updatePrimaryUserEmail },
                        { method: "POST" }
                     );
                  }}
               >
                  {options.map((user) => (
                     <option value={user.value} key={user.value}>
                        {user.label}
                        {user.user.id.includes("facebook") && " (Facebook)"}
                        {user.user.id.includes("google") && " (Google)"}
                        {user.user.id.includes("auth0") && " (Auth0)"}
                     </option>
                  ))}
               </Select>
            )}
         />
         <FormDescription>Denne eposten blir brukt til å sende ut informasjon</FormDescription>
      </FormItem>
   );
};
