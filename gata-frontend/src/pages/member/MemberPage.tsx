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
import { Loading, LoadingButton } from "../../components/Loading";
import { useRoles } from "../../components/useRoles";
import { IGataUser } from "../../types/GataUser.type";
import { PageLayout } from "../../components/PageLayout";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { Email } from "@mui/icons-material";
import { usePublishKontigentReport } from "../../api/contingent.api";

export const MemberPage = () => {
   const { isAdmin } = useRoles();
   const { usersResponse, getUsers } = useGetUsers();
   const { cacheResponse, clearCache } = useClearUserCache();
   const { publishContigent, publishContigentResponse } = usePublishKontigentReport();
   const { openConfirmDialog: openConfirmPublishKontigent, ConfirmDialogComponent: ConfirmPublishKontigentDialog } =
      useConfirmDialog({
         text: `Det ble sent en email til: ${
            publishContigentResponse.data && publishContigentResponse.data.length
               ? publishContigentResponse.data?.join(", ")
               : "Ingen"
         }`,
         title: "Vellykket",
         showOnlyOk: true,
      });

   const handleUpdate = async () => {
      const { status } = await clearCache();
      if (status === "success") {
         getUsers();
      }
   };

   const startPublishContigent = async () => {
      const { data } = await publishContigent();
      data && openConfirmPublishKontigent();
   };

   return (
      <PageLayout>
         <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h1" id="role-title">
               Medlemmer
            </Typography>
            {isAdmin && <Button onClick={handleUpdate}>Oppdater</Button>}
            {isAdmin && (
               <LoadingButton
                  response={publishContigentResponse}
                  variant="text"
                  startIcon={<Email />}
                  onClick={startPublishContigent}
                  sx={{ mr: 1 }}
               >
                  Kontigent
               </LoadingButton>
            )}
         </Box>
         {ConfirmPublishKontigentDialog}
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
