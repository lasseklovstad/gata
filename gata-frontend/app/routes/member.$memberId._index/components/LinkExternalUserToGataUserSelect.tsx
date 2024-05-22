import { useFetcher } from "@remix-run/react";
import Select from "react-select";

import { FormControl, FormDescription, FormItem, FormLabel } from "~/components/ui/form";
import type { IExternalUser, IGataUser } from "~/types/GataUser.type";
import { getSelectDefaultProps } from "~/utils/selectUtils";

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

   const menuItems = [...externalUserProviders, ...notMemberUsers];

   const options = menuItems.map((user) => ({
      label: user.email,
      value: user.id,
      icon: <ExternalUserIcon user={user} />,
      isFixed: !!user.primary,
   }));

   const selectedOptions = options.filter((option) => !!externalUserProviders.find((user) => user.id === option.value));

   return (
      <>
         <FormItem name="externalUserId">
            <FormLabel>Epost tilknytninger</FormLabel>
            <FormControl
               render={({ id: inputId, ...props }) => (
                  <Select
                     {...props}
                     {...getSelectDefaultProps<true>()}
                     inputId={inputId}
                     value={selectedOptions}
                     options={options}
                     isMulti
                     onChange={(options) => {
                        const userIds = options.map((o) => o.value);
                        const formData = new FormData();
                        formData.set("userId", id);
                        formData.set("intent", memberIntent.updateLinkedUsers);
                        userIds.forEach((userId) => formData.append("externalUserId", userId));
                        fetcher.submit(formData, { method: "PUT" });
                     }}
                     isClearable={false}
                  />
               )}
            />
            <FormDescription>
               Hvis en bruker har logget inn med forskjellige tjenester, kan disse kontoene knyttes sammen her!
            </FormDescription>
         </FormItem>
      </>
   );
};
