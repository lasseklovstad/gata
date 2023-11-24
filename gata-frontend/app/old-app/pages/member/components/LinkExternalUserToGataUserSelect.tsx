import { Flex, FormControl, FormHelperText, FormLabel, Text } from "@chakra-ui/react";
import type { IExternalUser, IGataUser } from "../../../types/GataUser.type";
import { ExternalUserIcon } from "../../../components/ExternalUserIcon";
import type { ChakraStylesConfig, OptionBase, Props } from "chakra-react-select";
import { chakraComponents, Select } from "chakra-react-select";
import type { ReactNode } from "react";
import { useFetcher, useFormAction } from "@remix-run/react";

type LinkExternalUserToGataUserSelectProps = {
   user: IGataUser;
   notMemberUsers: IExternalUser[];
};

export const LinkExternalUserToGataUserSelect = ({
   user: { externalUserProviders, id },
   notMemberUsers,
}: LinkExternalUserToGataUserSelectProps) => {
   const fetcher = useFetcher();
   const action = useFormAction();
   const handleChange: Props<ColorOption, true>["onChange"] = async (options) => {
      const userIds = options.map((o) => o.value);
      const formData = new FormData();
      formData.set("userId", id);
      userIds.forEach((userId) => formData.append("externalUserId", userId));
      fetcher.submit(formData, { action: `${action}/externaluserproviders`, method: "put" });
   };

   const menuItems = [...externalUserProviders, ...notMemberUsers];

   const options = menuItems.map((user) => ({
      label: user.email,
      value: user.id,
      icon: <ExternalUserIcon user={user} sx={{ mr: 1 }} />,
      isClearable: !user.primary,
   }));

   const selectedOption = options.filter((option) => !!externalUserProviders.find((user) => user.id === option.value));

   return (
      <>
         <FormControl sx={{ mt: 1, mb: 1 }}>
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

const customComponents: Props<ColorOption, true, never>["components"] = {
   Option: ({ children, ...props }) => (
      <chakraComponents.Option {...props}>
         {props.data.icon} {children}
      </chakraComponents.Option>
   ),
   MultiValue: ({ children, ...props }) => (
      <chakraComponents.MultiValue {...props}>
         <Flex alignItems="center">
            {props.data.icon} <Text>{children}</Text>
         </Flex>
      </chakraComponents.MultiValue>
   ),
   MultiValueRemove: (props) => (
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
