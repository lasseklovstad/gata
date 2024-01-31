import { Flex, FormControl, FormHelperText, FormLabel, useId } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import type { OptionBase, OptionProps, SingleValueProps } from "chakra-react-select";
import { Select, chakraComponents } from "chakra-react-select";

import { ExternalUserIcon } from "./ExternalUserIcon";
import type { IExternalUser, IGataUser } from "../types/GataUser.type";

type SelectPrimaryEmailProps = {
   user: IGataUser;
};

export const SelectPrimaryEmail = ({ user }: SelectPrimaryEmailProps) => {
   const fetcher = useFetcher();
   const selectId = useId();

   const options = user.externalUserProviders.map((user) => ({
      label: user.email,
      value: user.id,
      user: user,
   }));

   const selectedOption = options.find((option) => option.value === user.primaryUser.id);
   const inputId = selectId + "-input";
   return (
      <FormControl maxWidth={400} sx={{ mt: 1, mb: 1 }} id={inputId}>
         <FormLabel>Primær epost</FormLabel>
         <Select<ColorOption, false, never>
            name="primaryUserEmail"
            value={selectedOption}
            components={customComponents}
            onChange={(option) => {
               fetcher.submit(
                  { primaryUserEmail: option?.value || "" },
                  { action: "primaryUserEmail", method: "post" }
               );
            }}
            options={options}
            isLoading={fetcher.state !== "idle"}
            required={false}
            inputId={inputId}
            instanceId={selectId}
         />
         <FormHelperText>Denne eposten blir brukt til å sende ut informasjon</FormHelperText>
      </FormControl>
   );
};

interface ColorOption extends OptionBase {
   label: string;
   value: string;
   user: IExternalUser;
}

const customComponents = {
   Option: ({ children, ...props }: OptionProps<ColorOption, false, never>) => (
      <chakraComponents.Option {...props}>
         <ExternalUserIcon user={props.data.user} sx={{ mr: 1 }} color={props.isSelected ? "white" : "blue.500"} />{" "}
         {children}
      </chakraComponents.Option>
   ),
   SingleValue: ({ children, ...props }: SingleValueProps<ColorOption, false, never>) => (
      <chakraComponents.SingleValue {...props}>
         <Flex>
            <ExternalUserIcon user={props.data.user} sx={{ mr: 1 }} /> {children}
         </Flex>
      </chakraComponents.SingleValue>
   ),
};
