import { Avatar, Box, Button, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useClearUserCache, useGetUsers } from "../api/user.api";
import { Loading } from "../components/Loading";
import { useRoles } from "../components/useRoles";
import { IAuth0User } from "../types/Auth0User.type";

export const MemberPage = () => {
   const { isAdmin } = useRoles();
   const { usersResponse, getUsers } = useGetUsers();
   const { cacheResponse, clearCache } = useClearUserCache();
   const handleUpdate = async () => {
      const { status } = await clearCache();
      if (status === "success") {
         getUsers();
      }
   };
   return (
      <>
         <Box display="flex" justifyContent="space-between">
            <Typography variant="h1" id="role-title">
               Medlemer
            </Typography>
            {isAdmin && <Button onClick={handleUpdate}>Oppdater</Button>}
         </Box>
         <Loading response={cacheResponse} alertTitle="Det oppstod en feil ved oppdatering av cache" />
         <Loading response={usersResponse} alertTitle="Det oppstod en feil ved henting av medlemer" />
         <List aria-labelledby="member-title">
            {usersResponse.data?.map((user) => {
               return (
                  <ListItemButton key={user.user_id} divider component={Link} to={encodeURIComponent(user.user_id)}>
                     <ListItemIcon>
                        <Avatar src={user.picture} />
                     </ListItemIcon>
                     <ListItemText primary={user.name} secondary={getRolesFormated(user)} />
                  </ListItemButton>
               );
            })}
         </List>
      </>
   );
};

const getRolesFormated = (user: IAuth0User) => {
   if (user.roles.length === 0) {
      return "Ikke meldem";
   }
   return user.roles.map((role) => role.name).join(", ");
};
