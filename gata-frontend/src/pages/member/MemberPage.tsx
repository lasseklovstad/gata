import { Box, Button, Heading, List, ListItem, Tooltip } from "@chakra-ui/react";
import { Email } from "@mui/icons-material";
import { ActionFunction, LoaderFunction, useLoaderData, useRevalidator } from "react-router-dom";

import { ExternalUsersWithNoGataUser } from "./components/ExternalUsersWithNoGataUser";
import { UserListItem } from "./components/UserListItem";
import { client } from "../../api/client/client";
import { usePublishKontigentReport } from "../../api/contingent.api";
import { useClearUserCache } from "../../api/user.api";
import { getRequiredAccessToken } from "../../auth0Client";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { Loading, LoadingButton } from "../../components/Loading";
import { PageLayout } from "../../components/PageLayout";
import { isAdmin } from "../../components/useRoles";
import { IExternalUser, IGataUser } from "../../types/GataUser.type";

export const memberPageLoader: LoaderFunction = async ({ request: { signal } }) => {
   const token = await getRequiredAccessToken();
   const loggedInUser = await client("user/loggedin", { token, signal });
   const users = await client("user", { token, signal });
   const externalUsers = await client("auth0user/nogatauser", { token, signal });
   return { loggedInUser, users, externalUsers };
};

export const memberPageAction: ActionFunction = async ({ request }) => {
   const token = await getRequiredAccessToken();
   const form = Object.fromEntries(await request.formData());
   await client("user", { method: "POST", body: form, token });
   return { ok: true };
};

interface MemberPageLoaderData {
   loggedInUser: IGataUser;
   users: IGataUser[];
   externalUsers: IExternalUser[];
}

export const MemberPage = () => {
   const { loggedInUser, users, externalUsers } = useLoaderData() as MemberPageLoaderData;
   const { cacheResponse, clearCache } = useClearUserCache();
   const { publishContigent, publishContigentResponse } = usePublishKontigentReport();
   const revalidate = useRevalidator();
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
         revalidate.revalidate();
      }
   };

   const startPublishContigent = async () => {
      const { data } = await publishContigent();
      data && openConfirmPublishKontigent();
   };

   const admins = users.filter((user) => user.isUserAdmin);
   const members = users.filter((user) => user.isUserMember && !user.isUserAdmin);
   const nonMembers = users.filter((user) => !user.isUserMember && !user.isUserAdmin);

   return (
      <PageLayout>
         <Box display="flex" justifyContent="space-between" alignItems="center">
            <Heading as="h1" size="xl">
               Brukere
            </Heading>
            {isAdmin(loggedInUser) && (
               <Tooltip label="Hent nye brukere som har logget inn">
                  <Button variant="ghost" onClick={handleUpdate}>
                     Oppdater
                  </Button>
               </Tooltip>
            )}
            {isAdmin(loggedInUser) && (
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
         <Heading as="h2" id="admin-title" size="lg">
            Administratorer
         </Heading>
         <List aria-labelledby="admin-title">
            {admins.map((user) => {
               return <UserListItem key={user.id} user={user} isLoggedInUserAdmin={isAdmin(loggedInUser)} />;
            })}
            {admins.length === 0 && <ListItem>Ingen administratorer funnet</ListItem>}
         </List>
         <Heading as="h2" id="member-title" size="lg">
            Medlemmer
         </Heading>
         <List aria-labelledby="member-title">
            {members?.map((user) => {
               return <UserListItem key={user.id} user={user} isLoggedInUserAdmin={isAdmin(loggedInUser)} />;
            })}
            {members.length === 0 && <ListItem>Ingen medlemmer funnet</ListItem>}
         </List>
         {isAdmin(loggedInUser) && (
            <>
               <Heading variant="h2" id="non-member-title" size="lg">
                  Ikke medlem
               </Heading>
               <List aria-labelledby="non-member-title">
                  {nonMembers?.map((user) => {
                     return <UserListItem key={user.id} user={user} isLoggedInUserAdmin={isAdmin(loggedInUser)} />;
                  })}
                  {nonMembers?.length === 0 && <ListItem>Ingen andre brukere</ListItem>}
               </List>
               <ExternalUsersWithNoGataUser externalUsers={externalUsers} />
            </>
         )}
      </PageLayout>
   );
};
