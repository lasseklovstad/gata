import { Flex, FormControl, FormHelperText, FormLabel, Text } from "@chakra-ui/react";
import {
   ChakraStylesConfig,
   MultiValueProps,
   MultiValueRemoveProps,
   OptionBase,
   OptionProps,
   Props,
   Select,
   chakraComponents,
} from "chakra-react-select";
import { ReactNode } from "react";
import { ActionFunction, useFetcher } from "react-router-dom";

import { client } from "../../../api/client/client";
import { getRequiredAccessToken } from "../../../auth0Client";
import { ExternalUserIcon } from "../../../components/ExternalUserIcon";
import { IExternalUser, IGataUser } from "../../../types/GataUser.type";

export const externalUserProvidersAction: ActionFunction = async ({ request }) => {
   const token = await getRequiredAccessToken();
   const form = await request.formData();
   await client<undefined>(`user/${form.get("userId")}/externaluserproviders`, {
      method: "PUT",
      body: form.getAll("externalUserId"),
      token,
   });
   return new Response("", { status: 200 });
};

type LinkExternalUserToGataUserSelectProps = {
   user: IGataUser;
   notMemberUsers: IExternalUser[];
};

export const LinkExternalUserToGataUserSelect = ({
   user: { externalUserProviders, id },
   notMemberUsers,
}: LinkExternalUserToGataUserSelectProps) => {
   const fetcher = useFetcher();
   const handleChange: Props<ColorOption, true>["onChange"] = (options) => {
      const userIds = options.map((o) => o.value);
      const formData = new FormData();
      formData.set("userId", id);
      userIds.forEach((userId) => formData.append("externalUserId", userId));
      fetcher.submit(formData, { action: "externaluserproviders", method: "PUT" });
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
