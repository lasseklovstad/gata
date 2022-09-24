import { Flex, FormControl, FormHelperText, FormLabel, Text } from "@chakra-ui/react";
import { useGetExternalUsersWithNoGataUser, useUpdateExternalUsers } from "../../api/user.api";
import { IGataUser } from "../../types/GataUser.type";
import { ExternalUserIcon } from "../../components/ExternalUserIcon";
import { ErrorAlert } from "../../components/ErrorAlert";
import { chakraComponents, ChakraStylesConfig, OptionBase, Props, Select } from "chakra-react-select";
import { ReactNode } from "react";

type LinkExternalUserToGataUserSelectProps = {
   user: IGataUser;
   onChange: (user: IGataUser) => void;
};

export const LinkExternalUserToGataUserSelect = ({
   user: { externalUserProviders, id },
   onChange,
}: LinkExternalUserToGataUserSelectProps) => {
   const { usersResponse, updateExternalUsersWithNoGataUser } = useGetExternalUsersWithNoGataUser();
   const { updateExternalUsers, updateExternalUsersResponse } = useUpdateExternalUsers(id);

   const handleChange: Props<ColorOption, true>["onChange"] = async (options) => {
      const userIds = options.map((o) => o.value);
      const { data, status } = await updateExternalUsers(userIds);
      if (data && status === "success") {
         updateExternalUsersWithNoGataUser(menuItems?.filter(({ id }) => !userIds.includes(id)) || []);
         onChange(data);
      }
   };

   const menuItems = [...externalUserProviders, ...(usersResponse.data || [])];

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
               isLoading={updateExternalUsersResponse.status === "loading"}
            />
            <FormHelperText>
               Hvis en bruker har logget inn med forskjellige tjenester, kan disse kontoene knyttes sammen her!
            </FormHelperText>
            <ErrorAlert
               response={updateExternalUsersResponse}
               alertTitle="Det oppstod en feil ved lagring av eksterne brukere"
            />
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
