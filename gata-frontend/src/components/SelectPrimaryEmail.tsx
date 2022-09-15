import { IGataUser } from "../types/GataUser.type";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";
import { SelectInputProps } from "@mui/material/Select/SelectInput";

type SelectPrimaryEmailProps = {
   user: IGataUser;
};

export const SelectPrimaryEmail = ({ user }: SelectPrimaryEmailProps) => {
   const handleChange: SelectInputProps<string>["onChange"] = (ev) => {
      console.log(ev.target.value);
   };

   return (
      <FormControl sx={{ mt: 1, mb: 1 }}>
         <InputLabel id="demo-simple-select-label">Primær epost</InputLabel>
         <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={user.primaryUser.id}
            label="Primær epost"
            onChange={handleChange}
         >
            {user.externalUserProviders.map((user) => (
               <MenuItem key={user.id} value={user.id}>
                  {user.email}
               </MenuItem>
            ))}
         </Select>
         <FormHelperText>Denne eposten blir brukt til å sende ut informasjon</FormHelperText>
      </FormControl>
   );
};
