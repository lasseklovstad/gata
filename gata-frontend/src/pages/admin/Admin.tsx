import { Typography } from "@mui/material";
import { useRoles } from "../../components/useRoles";

export const Admin = () => {
   const { isAdmin, isMember } = useRoles();
   return (
      <>
         <Typography variant="h1">Admin</Typography>
         {isAdmin && (
            <Typography variant="body1">
               Velkommen til sidene for admin. Her kan du administrere gatamedlemmer. Velg en underside på venstre side.
            </Typography>
         )}
         {!isAdmin && isMember && (
            <Typography variant="body1">
               Velkommen til sidene for admin. Her kan du se informasjon om medlemmer.
            </Typography>
         )}
      </>
   );
};
