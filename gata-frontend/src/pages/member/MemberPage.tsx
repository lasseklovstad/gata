import {
   Avatar,
   Box,
   Button,
   List,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useClearUserCache, useGetUsers } from "../../api/user.api";
import { Loading } from "../../components/Loading";
import { useRoles } from "../../components/useRoles";
import { IGataUser } from "../../types/GataUser.type";
import { PageLayout } from "../../components/PageLayout";

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
      <PageLayout>
         <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h1" id="role-title">
               Medlemmer
            </Typography>
            {isAdmin && <Button onClick={handleUpdate}>Oppdater</Button>}
         </Box>
         <Loading response={cacheResponse} alertTitle="Det oppstod en feil ved oppdatering av cache" />
         <Loading response={usersResponse} alertTitle="Det oppstod en feil ved henting av medlemer" />
         <List aria-labelledby="member-title">
            {usersResponse.data?.map((user) => {
               return (
                  <ListItemButton key={user.id} divider component={Link} to={user.id}>
                     <ListItemIcon>
                        <Avatar src={user.picture} />
                     </ListItemIcon>
                     <ListItemText primary={user.name} secondary={getRolesFormated(user)} />
                  </ListItemButton>
               );
            })}
            {usersResponse.data?.length === 0 && (
               <ListItem>
                  <ListItemText>Ingen medlemmer funnet</ListItemText>
               </ListItem>
            )}
         </List>
      </PageLayout>
   );
};

const getRolesFormated = (user: IGataUser) => {
   if (user.roles.length === 0) {
      return "Ikke meldem";
   }
   return user.roles.map((role) => role.name).join(", ");
};
