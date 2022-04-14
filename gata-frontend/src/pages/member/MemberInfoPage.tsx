import { Avatar, Box, Button, List, ListItem, ListItemSecondaryAction, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetRoles, useUpdateUserRoles } from "../../api/role.api";
import { useGetUser } from "../../api/user.api";
import { Loading } from "../../components/Loading";
import { useRoles } from "../../components/useRoles";
import { IGataRole } from "../../types/GataRole.type";
import { IGataUser } from "../../types/GataUser.type";
import { MemberResponsibility } from "./MemberResponsibility";

export const MemberInfoPage = () => {
   const { isAdmin } = useRoles();
   const { memberId } = useParams<{ memberId: string }>();
   const { userResponse } = useGetUser(memberId!!);
   const [user, setUser] = useState<IGataUser>();

   const { rolesResponse } = useGetRoles();

   useEffect(() => {
      userResponse.data && setUser(userResponse.data);
   }, [userResponse.data]);

   return (
      <>
         <Box display="flex" alignItems="center">
            <Avatar src={user?.picture} sx={{ mr: 1 }} />
            <Typography variant="h1">Informasjon</Typography>
         </Box>
         <Loading response={userResponse} />
         <Box m={1}>
            <Typography variant="body1">
               <strong>Navn:</strong> {user?.name}
            </Typography>
            <Typography variant="body1">
               <strong>Email:</strong> {user?.email}
            </Typography>
         </Box>
         <Typography variant="h2">Roller</Typography>
         <Loading response={rolesResponse} />
         <List>
            {rolesResponse.data?.map((role) => {
               return (
                  <ListItem divider key={role.id}>
                     {role.name}
                     {isAdmin && (
                        <ListItemSecondaryAction>
                           {user && <RoleButton role={role} user={user} onChange={(newUser) => setUser(newUser)} />}
                        </ListItemSecondaryAction>
                     )}
                  </ListItem>
               );
            })}
         </List>

         {user?.isUserMember && <MemberResponsibility user={user} />}
      </>
   );
};

type RoleButtonProps = {
   role: IGataRole;
   user: IGataUser;
   onChange: (user: IGataUser) => void;
};

const RoleButton = ({ role, user, onChange }: RoleButtonProps) => {
   const hasRole = !!user.roles.find((r) => r.name === role.name);
   const { postRoleResponse, deleteRole, postRole } = useUpdateUserRoles(user.id);
   const handleClick = async () => {
      const { status, data } = await (hasRole ? deleteRole(role.id) : postRole(role.id));
      if (status === "success" && data) {
         onChange(data);
      }
   };
   return (
      <Button variant="outlined" onClick={handleClick} disabled={postRoleResponse.status === "loading"}>
         {hasRole ? "Fjern rolle" : "Legg til rolle"}
      </Button>
   );
};
