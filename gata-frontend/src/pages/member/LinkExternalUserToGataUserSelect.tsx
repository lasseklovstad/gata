import { Box, Chip, FormControl, FormHelperText, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import { useGetExternalUsersWithNoGataUser } from "../../api/user.api";
import { IExternalUser } from "../../types/GataUser.type";
import { SelectInputProps } from "@mui/material/Select/SelectInput";

type LinkExternalUserToGataUserSelectProps = {
   externalUsers: IExternalUser[];
   onChange: (externalUsers: IExternalUser[]) => void;
};

export const LinkExternalUserToGataUserSelect = ({
   externalUsers,
   onChange,
}: LinkExternalUserToGataUserSelectProps) => {
   const { usersResponse, updateExternalUsers } = useGetExternalUsersWithNoGataUser();

   const handleChange: SelectInputProps<string[]>["onChange"] = (ev) => {
      const updatedExternalUsers = menuItems.filter(({ id }) => ev.target.value.includes(id)) || [];
      updateExternalUsers(menuItems?.filter(({ id }) => !ev.target.value.includes(id)) || []);
      onChange(updatedExternalUsers);
   };

   const menuItems = [...externalUsers, ...(usersResponse.data || [])];

   return (
      <>
         <FormControl sx={{ mt: 1, mb: 1 }} fullWidth>
            <InputLabel id="demo-multiple-name-label">Epost tilknytninger</InputLabel>
            <Select
               labelId="demo-multiple-name-label"
               id="demo-multiple-name"
               multiple
               value={externalUsers.map((user) => user.id)}
               onChange={handleChange}
               input={<OutlinedInput label="Epost tilknytninger" />}
               MenuProps={MenuProps}
               renderValue={(selected) => {
                  const items = menuItems.filter((user) => selected.includes(user.id));
                  return (
                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {items.map((user) => (
                           <Chip key={user.id} label={user.email} />
                        ))}
                     </Box>
                  );
               }}
            >
               {menuItems.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                     {user.email}
                  </MenuItem>
               ))}
            </Select>

            <FormHelperText>
               Hvis en bruker har logget inn med forskjellige tjenester, kan disse kontoene knyttes sammen her!
            </FormHelperText>
         </FormControl>
      </>
   );
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
   PaperProps: {
      style: {
         maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
         width: 250,
      },
   },
};
