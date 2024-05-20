import { useFetcher } from "@remix-run/react";
import { useId } from "react";
import Select, { GroupBase, SelectComponentsConfig, StylesConfig, components } from "react-select";

import type { IExternalUser, IGataUser } from "~/types/GataUser.type";

import { FormControl, FormDescription, FormItem, FormLabel } from "~/components/ui/form";
import { Typography } from "~/components/ui/typography";
import { memberIntent } from "../intent";
import { ExternalUserIcon } from "./ExternalUserIcon";
import { cn } from "~/utils";
import { X } from "lucide-react";

type LinkExternalUserToGataUserSelectProps = {
   user: IGataUser;
   notMemberUsers: IExternalUser[];
};

export const LinkExternalUserToGataUserSelect = ({
   user: { externalUserProviders, id },
   notMemberUsers,
}: LinkExternalUserToGataUserSelectProps) => {
   const fetcher = useFetcher();
   const selectId = useId();

   const menuItems = [...externalUserProviders, ...notMemberUsers];

   const options = menuItems.map((user) => ({
      label: user.email,
      value: user.id,
      icon: <ExternalUserIcon user={user} sx={{ mr: 1 }} />,
      isFixed: !!user.primary,
   }));

   const selectedOptions = options.filter((option) => !!externalUserProviders.find((user) => user.id === option.value));
   type UserOption = (typeof options)[number];
   const styles: StylesConfig<UserOption, true> = {
      multiValue: (base, state) => {
         return state.data.isFixed ? { ...base, paddingRight: "4px" } : base;
      },
      multiValueLabel: (base, state) => {
         return state.data.isFixed ? base : base;
      },
      multiValueRemove: (base, state) => {
         return state.data.isFixed ? { ...base, display: "none" } : base;
      },
   };
   const customComponents: SelectComponentsConfig<UserOption, true, GroupBase<UserOption>> = {
      Option: ({ children, ...props }) => (
         <components.Option {...props}>
            <div className="flex gap-2 items-center">
               {props.data.icon} {children}
            </div>
         </components.Option>
      ),
      MultiValue: ({ children, ...props }) => (
         <components.MultiValue {...props}>
            <div className="flex gap-2 items-center">
               {props.data.icon} {children}
            </div>
         </components.MultiValue>
      ),
      MultiValueRemove: (props) => (
         <components.MultiValueRemove
            {...props}
            innerProps={{
               ...props.innerProps,
               "aria-label": `Fjern ${props.data.label}`,
            }}
         >
            <X />
         </components.MultiValueRemove>
      ),
   };

   return (
      <>
         <FormItem name="123">
            <FormLabel>Epost tilknytninger</FormLabel>
            <FormControl
               render={() => (
                  <Select
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
                     unstyled
                     styles={styles}
                     classNames={{
                        control: () => "border p-2 rounded",
                        valueContainer: () => "flex gap-2",
                        multiValue: () => "bg-primary/10 p-0.5 rounded",
                        multiValueRemove: () => "rounded-full text-gray-500 hover:text-gray-800",
                        menuList: () => "bg-background p-1 rounded z-10 border",
                        option: ({ isFocused, isSelected }) =>
                           cn(isFocused && "bg-primary/10", isSelected && "bg-primary/10", "px-2 py-1"),
                     }}
                     isClearable={false}
                     components={customComponents}
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
