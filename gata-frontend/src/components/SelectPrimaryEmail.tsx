import { IExternalUser, IGataUser } from "../types/GataUser.type";
import { Flex, FormControl, FormHelperText, FormLabel } from "@chakra-ui/react";
import { usePrimaryExternalUser } from "../api/user.api";
import { ErrorAlert } from "./ErrorAlert";
import { chakraComponents, OptionBase, Props, Select } from "chakra-react-select";
import { ExternalUserIcon } from "./ExternalUserIcon";

type SelectPrimaryEmailProps = {
   user: IGataUser;
   onChange: (user: IGataUser) => void;
};

export const SelectPrimaryEmail = ({ user, onChange }: SelectPrimaryEmailProps) => {
   const { updatePrimaryUserResponse, updatePrimaryUser } = usePrimaryExternalUser(user.id);
   const handleChange: Props<ColorOption, false>["onChange"] = async (option) => {
      if (option?.value) {
         const { data, status } = await updatePrimaryUser(option.value);
         if (data && status === "success") {
            onChange(data);
         }
      }
   };

   const options = user.externalUserProviders.map((user) => ({
      label: user.email,
      value: user.id,
      user: user,
   }));

   const selectedOption = options.find((option) => option.value === user.primaryUser.id);

   return (
      <FormControl maxWidth={400} sx={{ mt: 1, mb: 1 }}>
         <FormLabel>Primær epost</FormLabel>
         <Select<ColorOption, false, never>
            value={selectedOption}
            onChange={handleChange}
            components={customComponents}
            options={options}
            isLoading={updatePrimaryUserResponse.status === "loading"}
         />
         <FormHelperText>Denne eposten blir brukt til å sende ut informasjon</FormHelperText>
         <ErrorAlert
            response={updatePrimaryUserResponse}
            alertTitle="Det oppstod en feil ved lagring av primær bruker"
         />
      </FormControl>
   );
};

interface ColorOption extends OptionBase {
   label: string;
   value: string;
   user: IExternalUser;
}

const customComponents: Props<ColorOption, false, never>["components"] = {
   Option: ({ children, ...props }) => (
      <chakraComponents.Option {...props}>
         <ExternalUserIcon user={props.data.user} sx={{ mr: 1 }} color={props.isSelected ? "white" : "blue.500"} />{" "}
         {children}
      </chakraComponents.Option>
   ),
   SingleValue: ({ children, ...props }) => (
      <chakraComponents.SingleValue {...props}>
         <Flex>
            <ExternalUserIcon user={props.data.user} sx={{ mr: 1 }} /> {children}
         </Flex>
      </chakraComponents.SingleValue>
   ),
};
