import { Box, Button, Heading, List, ListItem, Tooltip } from "@chakra-ui/react";
import { useClearUserCache, useGetUsers } from "../../api/user.api";
import { Loading, LoadingButton } from "../../components/Loading";
import { useRoles } from "../../components/useRoles";
import { PageLayout } from "../../components/PageLayout";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { Email } from "@mui/icons-material";
import { usePublishKontigentReport } from "../../api/contingent.api";
import { UserListItem } from "./UserListItem";
import { ExternalUsersWithNoGataUser } from "./ExternalUsersWithNoGataUser";

export const MemberPage = () => {
   const { isAdmin } = useRoles();
   const { usersResponse, getUsers, updateUser } = useGetUsers();
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
            <Heading as="h1" size="xl">
               Brukere
            </Heading>
            {isAdmin && (
               <Tooltip label="Hent nye brukere som har logget inn">
                  <Button variant="ghost" onClick={handleUpdate}>
                     Oppdater
                  </Button>
               </Tooltip>
            )}
            {isAdmin && (
               <Tooltip label="Send påminnelse om betaling til de som ikke har betalt kontigent">
                  <LoadingButton
                     response={publishContigentResponse}
                     variant="ghost"
                     leftIcon={<Email />}
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
         <Heading as="h2" id="admin-title" size="lg">
            Administratorer
         </Heading>
         <List aria-labelledby="admin-title">
            {admins?.map((user) => {
               return <UserListItem key={user.id} user={user} />;
            })}
            {admins?.length === 0 && <ListItem>Ingen administratorer funnet</ListItem>}
         </List>
         <Heading as="h2" id="member-title" size="lg">
            Medlemmer
         </Heading>
         <List aria-labelledby="member-title">
            {members?.map((user) => {
               return <UserListItem key={user.id} user={user} />;
            })}
            {usersResponse.data?.length === 0 && <ListItem>Ingen medlemmer funnet</ListItem>}
         </List>
         {isAdmin && (
            <>
               <Heading variant="h2" id="non-member-title" size="lg">
                  Ikke medlem
               </Heading>
               <List aria-labelledby="non-member-title">
                  {nonMembers?.map((user) => {
                     return <UserListItem key={user.id} user={user} />;
                  })}
                  {nonMembers?.length === 0 && <ListItem>Ingen andre brukere</ListItem>}
               </List>
               <ExternalUsersWithNoGataUser
                  onAddUser={(newUser) => {
                     updateUser((users) => {
                        if (users) {
                           return [...users, newUser];
                        } else {
                           return [newUser];
                        }
                     });
                  }}
               />
            </>
         )}
      </PageLayout>
   );
};
