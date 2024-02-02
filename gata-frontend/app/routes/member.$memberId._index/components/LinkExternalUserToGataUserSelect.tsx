import { Flex, FormControl, FormHelperText, FormLabel, Text } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import type {
   ChakraStylesConfig,
   MultiValueProps,
   MultiValueRemoveProps,
   OptionBase,
   OptionProps,
   Props,
} from "chakra-react-select";
import { Select, chakraComponents } from "chakra-react-select";
import { useId, type ReactNode } from "react";

import { ExternalUserIcon } from "~/routes/member.$memberId._index/components/ExternalUserIcon";
import type { IGataUser, IExternalUser } from "~/types/GataUser.type";

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
   const selectId = useId();
   const handleChange: Props<ColorOption, true>["onChange"] = (options) => {
      const userIds = options.map((o) => o.value);
      const formData = new FormData();
      formData.set("userId", id);
      formData.set("intent", memberIntent.updateLinkedUsers);
      userIds.forEach((userId) => formData.append("externalUserId", userId));
      fetcher.submit(formData, { method: "PUT" });
   };

   const menuItems = [...externalUserProviders, ...notMemberUsers];

   const options = menuItems.map((user) => ({
      label: user.email,
      value: user.id,
      icon: <ExternalUserIcon user={user} sx={{ mr: 1 }} />,
      isClearable: !user.primary,
   }));

   const selectedOption = options.filter((option) => !!externalUserProviders.find((user) => user.id === option.value));
   const inputId = selectId + "-input";
   return (
      <>
         <FormControl sx={{ mt: 1, mb: 1 }} id={inputId}>
            <FormLabel>Epost tilknytninger</FormLabel>
            <Select<ColorOption, true, never>
               value={selectedOption}
               isMulti
               onChange={handleChange}
               components={customComponents}
               options={options}
               isClearable={false}
               chakraStyles={chakraStyles}
               isLoading={fetcher.state !== "idle"}
               instanceId={selectId}
               inputId={inputId}
               required={false}
            />
            <FormHelperText>
               Hvis en bruker har logget inn med forskjellige tjenester, kan disse kontoene knyttes sammen her!
            </FormHelperText>
         </FormControl>
      </>
   );
};

interface ColorOption extends OptionBase {
   label: string;
   value: string;
   icon: ReactNode;
   isClearable: boolean;
}

const customComponents = {
   Option: ({ children, ...props }: OptionProps<ColorOption, true, never>) => (
      <chakraComponents.Option {...props}>
         {props.data.icon} {children}
      </chakraComponents.Option>
   ),
   MultiValue: ({ children, ...props }: MultiValueProps<ColorOption, true, never>) => (
      <chakraComponents.MultiValue {...props}>
         <Flex alignItems="center">
            {props.data.icon} <Text>{children}</Text>
         </Flex>
      </chakraComponents.MultiValue>
   ),
   MultiValueRemove: (props: MultiValueRemoveProps<ColorOption, true, never>) => (
      <chakraComponents.MultiValueRemove
         {...props}
         innerProps={{ ...props.innerProps, "aria-label": `Fjern ${props.data.label}` }}
      />
   ),
};

const chakraStyles: ChakraStylesConfig<ColorOption, true, never> = {
   multiValueRemove: (provided, state) => {
      return state.data.isClearable ? provided : { ...provided, display: "none" };
   },
};
