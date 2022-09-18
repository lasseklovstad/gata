import {
   Box,
   Chip,
   CircularProgress,
   FormControl,
   FormHelperText,
   InputLabel,
   OutlinedInput,
   Select,
} from "@mui/material";
import { useGetExternalUsersWithNoGataUser, useUpdateExternalUsers } from "../../api/user.api";
import { IGataUser } from "../../types/GataUser.type";
import { SelectInputProps } from "@mui/material/Select/SelectInput";
import { ExternalUserMenuItem } from "../../components/ExternalUserMenuItem";
import { ExternalUserIcon } from "../../components/ExternalUserIcon";
import { ErrorAlert } from "../../components/ErrorAlert";

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

   const handleChange: SelectInputProps<string[]>["onChange"] = async (ev) => {
      const { data, status } = await updateExternalUsers(ev.target.value as string[]);
      if (data && status === "success") {
         updateExternalUsersWithNoGataUser(menuItems?.filter(({ id }) => !ev.target.value.includes(id)) || []);
         onChange(data);
      }
   };

   const menuItems = [...externalUserProviders, ...(usersResponse.data || [])];

   return (
      <>
         <FormControl sx={{ mt: 1, mb: 1 }} fullWidth>
            <InputLabel id="demo-multiple-name-label">Epost tilknytninger</InputLabel>
            <Select
               labelId="demo-multiple-name-label"
               id="demo-multiple-name"
               multiple
               value={externalUserProviders.map((user) => user.id)}
               onChange={handleChange}
               input={<OutlinedInput label="Epost tilknytninger" />}
               renderValue={(selected) => {
                  const items = menuItems.filter((user) => selected.includes(user.id));
                  return (
                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
                        {items.map((user) => (
                           <Chip
                              icon={<ExternalUserIcon sx={{ ml: 1 }} user={user} />}
                              key={user.id}
                              label={user.email}
                           />
                        ))}
                        {updateExternalUsersResponse.status === "loading" && <CircularProgress />}
                     </Box>
                  );
               }}
            >
               {menuItems.map((user) => (
                  <ExternalUserMenuItem key={user.id} value={user.id} user={user} disabled={user.primary} />
               ))}
            </Select>

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
