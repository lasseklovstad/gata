import { IExternalUser, IGataUser } from "../types/GataUser.type";
import { Flex, FormControl, FormHelperText, FormLabel } from "@chakra-ui/react";
import { chakraComponents, OptionBase, Props, Select } from "chakra-react-select";
import { ExternalUserIcon } from "./ExternalUserIcon";
import { ActionFunction, useFetcher, useFormAction } from "react-router-dom";
import { client } from "../api/client/client";
import { getRequiredAccessToken } from "../auth0Client";

export const primaryUserEmailAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();
   const form = Object.fromEntries(await request.formData());
   await client(`user/${params.memberId}/primaryuser`, {
      method: "PUT",
      body: form.primaryUserEmail,
      token,
   });
   return {};
};

type SelectPrimaryEmailProps = {
   user: IGataUser;
};

export const SelectPrimaryEmail = ({ user }: SelectPrimaryEmailProps) => {
   const fetcher = useFetcher();
   const action = useFormAction();

   const options = user.externalUserProviders.map((user) => ({
      label: user.email,
      value: user.id,
      user: user,
   }));

   const selectedOption = options.find((option) => option.value === user.primaryUser.id);

   return (
      <fetcher.Form>
         <FormControl maxWidth={400} sx={{ mt: 1, mb: 1 }}>
            <FormLabel>Primær epost</FormLabel>
            <Select<ColorOption, false, never>
               name="primaryUserEmail"
               value={selectedOption}
               components={customComponents}
               onChange={(option) => {
                  fetcher.submit(
                     { primaryUserEmail: option?.value || "" },
                     { action: `${action}/primaryUserEmail`, method: "post" }
                  );
               }}
               options={options}
               isLoading={fetcher.state !== "idle"}
            />
            <FormHelperText>Denne eposten blir brukt til å sende ut informasjon</FormHelperText>
         </FormControl>
      </fetcher.Form>
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
