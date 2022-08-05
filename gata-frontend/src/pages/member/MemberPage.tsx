import {
   Avatar,
   Box,
   Button,
   List,
   ListItem,
   ListItemButton,
   ListItemIcon,
   ListItemText,
   Tooltip,
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
import { UserListItem } from "./UserListItem";

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

   const admins = usersResponse.data?.filter((user) => user.isUserAdmin);
   const members = usersResponse.data?.filter((user) => user.isUserMember && !user.isUserAdmin);
   const nonMembers = usersResponse.data?.filter((user) => !user.isUserMember && !user.isUserAdmin);

   return (
      <PageLayout>
         <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h1">Brukere</Typography>
            {isAdmin && (
               <Tooltip title={"Hent nye brukere som har logget inn"}>
                  <Button onClick={handleUpdate}>Oppdater</Button>
               </Tooltip>
            )}
            {isAdmin && (
               <Tooltip title={"Send påminnelse om betaling til de som ikke har betalt kontigent"}>
                  <LoadingButton
                     response={publishContigentResponse}
                     variant="text"
                     startIcon={<Email />}
                     onClick={startPublishContigent}
                     sx={{ mr: 1 }}
                  >
                     Kontigent
                  </LoadingButton>
               </Tooltip>
            )}
         </Box>
         {ConfirmPublishKontigentDialog}
         <Loading response={cacheResponse} alertTitle="Det oppstod en feil ved oppdatering av cache" />
         <Loading response={usersResponse} alertTitle="Det oppstod en feil ved henting av medlemer" />
         <Typography variant="h2" id="admin-title">
            Administratorer
         </Typography>
         <List aria-labelledby="admin-title">
            {admins?.map((user) => {
               return <UserListItem key={user.id} user={user} />;
            })}
            {admins?.length === 0 && (
               <ListItem>
                  <ListItemText>Ingen administratorer funnet</ListItemText>
               </ListItem>
            )}
         </List>
         <Typography variant="h2" id="member-title">
            Medlemmer
         </Typography>
         <List aria-labelledby="member-title">
            {members?.map((user) => {
               return <UserListItem key={user.id} user={user} />;
            })}
            {usersResponse.data?.length === 0 && (
               <ListItem>
                  <ListItemText>Ingen medlemmer funnet</ListItemText>
               </ListItem>
            )}
         </List>
         <Typography variant="h2" id="non-member-title">
            Ikke medlem
         </Typography>
         <List aria-labelledby="non-member-title">
            {nonMembers?.map((user) => {
               return <UserListItem key={user.id} user={user} />;
            })}
            {nonMembers?.length === 0 && (
               <ListItem>
                  <ListItemText>Ingen andre brukere</ListItemText>
               </ListItem>
            )}
         </List>
      </PageLayout>
   );
};
