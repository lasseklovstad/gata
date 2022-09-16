import { IGataUser } from "../types/GataUser.type";
import { Box, CircularProgress, FormControl, FormHelperText, InputLabel, OutlinedInput, Select } from "@mui/material";
import { SelectInputProps } from "@mui/material/Select/SelectInput";
import { ExternalUserMenuItem } from "./ExternalUserMenuItem";
import { usePrimaryExternalUser } from "../api/user.api";
import { ErrorAlert } from "./ErrorAlert";
import { ExternalUserIcon } from "./ExternalUserIcon";

type SelectPrimaryEmailProps = {
   user: IGataUser;
   onChange: (user: IGataUser) => void;
};

export const SelectPrimaryEmail = ({ user, onChange }: SelectPrimaryEmailProps) => {
   const { updatePrimaryUserResponse, updatePrimaryUser } = usePrimaryExternalUser(user.id);
   const handleChange: SelectInputProps<string>["onChange"] = async (ev) => {
      const { data, status } = await updatePrimaryUser(ev.target.value);
      if (data && status === "success") {
         onChange(data);
      }
   };

   const getSelectedUser = (id: string) => {
      return user.externalUserProviders.find((user) => id === user.id);
   };

   return (
      <FormControl sx={{ mt: 1, mb: 1 }}>
         <InputLabel id="primary-user-select-label">Primær epost</InputLabel>
         <Select
            labelId="primary-user-select-label"
            id="primary-user-select"
            value={user.primaryUser.id}
            input={<OutlinedInput label="Primær epost" />}
            onChange={handleChange}
            renderValue={(selected) => {
               const selectedUser = getSelectedUser(selected);
               if (!selectedUser) {
                  return "";
               }
               return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                     <ExternalUserIcon user={selectedUser} />
                     {selectedUser?.email}
                     {updatePrimaryUserResponse.status === "loading" && <CircularProgress size={20} />}
                  </Box>
               );
            }}
         >
            {user.externalUserProviders.map((user) => (
               <ExternalUserMenuItem key={user.id} value={user.id} user={user} />
            ))}
         </Select>
         <FormHelperText>Denne eposten blir brukt til å sende ut informasjon</FormHelperText>
         <ErrorAlert
            response={updatePrimaryUserResponse}
            alertTitle="Det oppstod en feil ved lagring av primær bruker"
         />
      </FormControl>
   );
};
