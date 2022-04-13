import { Avatar, Box, Button, List, ListItem, ListItemSecondaryAction, ListItemText, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetRoles, useUpdateUserRoles } from "../api/role.api";
import { useGetUser, useGetUserResponsitbility } from "../api/user.api";
import { Loading } from "../components/Loading";
import { IAuth0Role } from "../types/Auth0Role.type";
import { IAuth0User } from "../types/Auth0User.type";

export const MemberInfoPage = () => {
   const { memberId } = useParams<{ memberId: string }>();
   const { userResponse } = useGetUser(memberId!!);
   const { responsibilityResponse } = useGetUserResponsitbility(memberId!!);
   const { rolesResponse } = useGetRoles();

   return (
      <>
         <Box display="flex" alignItems="center">
            <Avatar src={userResponse.data?.picture} sx={{ mr: 1 }} />
            <Typography variant="h1">Informasjon</Typography>
         </Box>
         <Loading response={userResponse} />
         <Box m={1}>
            <Typography variant="body1">
               <strong>Navn:</strong> {userResponse.data?.name}
            </Typography>
            <Typography variant="body1">
               <strong>Email:</strong> {userResponse.data?.email}
            </Typography>
         </Box>
         <Typography variant="h2">Roller</Typography>
         <Loading response={rolesResponse} />
         <List>
            {rolesResponse.data?.map((role) => {
               return (
                  <ListItem divider key={role.id}>
                     {role.name}
                     <ListItemSecondaryAction>
                        {userResponse.data && <RoleButton role={role} user={userResponse.data} />}
                     </ListItemSecondaryAction>
                  </ListItem>
               );
            })}
         </List>
         <Typography variant="h2">Ansvarsposter</Typography>
         <Loading response={responsibilityResponse} />
         <List>
            {responsibilityResponse.data?.map((resp) => {
               return (
                  <ListItem divider key={resp.id}>
                     <ListItemText primary={resp.name} secondary={resp.description} />
                  </ListItem>
               );
            })}
            {responsibilityResponse.data?.length === 0 && <ListItem>Ingen ansvarsposter</ListItem>}
         </List>
      </>
   );
};

type RoleButtonProps = {
   role: IAuth0Role;
   user: IAuth0User;
};

const RoleButton = ({ role, user }: RoleButtonProps) => {
   const hasRoleDefault = !!user.roles.find((r) => r.name === role.name);
   const [hasRole, setHasRole] = useState(hasRoleDefault);
   const { postRoleResponse, deleteRole, postRole } = useUpdateUserRoles(user.user_id);
   const handleClick = async () => {
      const { status } = await (hasRole ? deleteRole(role.id) : postRole(role.id));
      if (status === "success") {
         setHasRole(!hasRole);
      }
   };
   return (
      <Button variant="outlined" onClick={handleClick} disabled={postRoleResponse.status === "loading"}>
         {hasRole ? "Fjern rolle" : "Legg til rolle"}
      </Button>
   );
};
