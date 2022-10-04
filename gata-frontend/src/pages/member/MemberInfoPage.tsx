import { Avatar, Box, Button, Divider, Flex, Heading, IconButton, List, ListItem } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetRoles, useUpdateUserRoles } from "../../api/role.api";
import { useDeleteUser, useGetUser } from "../../api/user.api";
import { Loading } from "../../components/Loading";
import { UserInfo } from "../../components/UserInfo";
import { useRoles } from "../../components/useRoles";
import { UserResponsibility } from "../../components/UserResponsibilities";
import { IGataRole } from "../../types/GataRole.type";
import { IGataUser } from "../../types/GataUser.type";
import { PageLayout } from "../../components/PageLayout";
import { Delete } from "@mui/icons-material";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { LinkExternalUserToGataUserSelect } from "./LinkExternalUserToGataUserSelect";

export const MemberInfoPage = () => {
   const { isAdmin } = useRoles();
   const { memberId } = useParams<{ memberId: string }>();
   const { userResponse, updateUser } = useGetUser(memberId!!);
   const { deleteUser, deleteUserResponse } = useDeleteUser(memberId!!);
   const navigate = useNavigate();
   const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog({
      text: "Ved å slette mister vi all informasjon knyttet til brukeren",
      response: deleteUserResponse,
      onConfirm: async () => {
         const { status } = await deleteUser();
         if (status === "success") {
            navigate("/member");
            return true;
         }
         return false;
      },
   });

   const user = userResponse.data;

   const { rolesResponse } = useGetRoles();

   return (
      <PageLayout>
         <Box display="flex" alignItems="center">
            <Avatar src={user?.primaryUser.picture} sx={{ mr: 1 }} />
            <Heading as="h1" flex={1}>
               Informasjon
            </Heading>
            {isAdmin && (
               <>
                  <IconButton variant="ghost" onClick={openConfirmDialog} icon={<Delete />} aria-label="Slett" />
                  {ConfirmDialogComponent}
               </>
            )}
         </Box>
         <Loading response={userResponse} />
         {user && <UserInfo user={user} onChange={updateUser} />}
         {isAdmin && user && <LinkExternalUserToGataUserSelect user={user} onChange={updateUser} />}
         <Heading as="h2">Roller</Heading>
         <Loading response={rolesResponse} />
         <List>
            {rolesResponse.data?.map((role) => {
               return (
                  <ListItem key={role.id}>
                     <Flex p={2} alignItems="center">
                        <Box flex={1}>{role.name}</Box>
                        {isAdmin && user && <RoleButton role={role} user={user} onChange={updateUser} />}
                     </Flex>
                     <Divider />
                  </ListItem>
               );
            })}
         </List>

         {user?.isUserMember && <UserResponsibility user={user} />}
      </PageLayout>
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
      <Button variant="outline" onClick={handleClick} isLoading={postRoleResponse.status === "loading"}>
         {hasRole ? "Fjern rolle" : "Legg til rolle"}
      </Button>
   );
};
