import { Box, Button, CircularProgress, Heading, List, ListItem, Tooltip } from "@chakra-ui/react";
import { Email } from "@mui/icons-material";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { client } from "~/old-app/api/client/client";
import { usePublishKontigentReport } from "~/old-app/api/contingent.api";
import { useConfirmDialog } from "~/old-app/components/ConfirmDialog";
import { LoadingButton } from "~/old-app/components/Loading";
import { PageLayout } from "~/old-app/components/PageLayout";
import { isAdmin } from "~/old-app/components/useRoles";
import { ExternalUsersWithNoGataUser } from "~/old-app/pages/member/components/ExternalUsersWithNoGataUser";
import { UserListItem } from "~/old-app/pages/member/components/UserListItem";
import type { IExternalUser, IGataUser } from "~/old-app/types/GataUser.type";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
   const { signal } = request;
   const token = await getRequiredAuthToken(request);
   const loggedInUser = await client("user/loggedin", { token, signal });
   const users = await client("user", { token, signal });
   const externalUsers = await client("auth0user/nogatauser", { token, signal });
   return { loggedInUser, users, externalUsers };
};

export const action = async ({ request }: ActionArgs) => {
   const token = await getRequiredAuthToken(request);
   const form = Object.fromEntries(await request.formData());
   return client("user", { method: "POST", body: form, token });
};

export interface MemberPageLoaderData {
   loggedInUser: IGataUser;
   users: IGataUser[];
   externalUsers: IExternalUser[];
}

export default function MemberPage() {
   const { loggedInUser, users, externalUsers } = useLoaderData() as MemberPageLoaderData;
   const { publishContigent, publishContigentResponse } = usePublishKontigentReport();
   const clearCacheFetcher = useFetcher();
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
                  <clearCacheFetcher.Form method="POST" action="clearCache">
                     <Button variant="ghost" type="submit">
                        Oppdater
                     </Button>
                  </clearCacheFetcher.Form>
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
         {clearCacheFetcher.state !== "idle" && <CircularProgress isIndeterminate />}
         <Heading as="h2" id="admin-title" size="lg">
            Administratorer
         </Heading>
         <List aria-labelledby="admin-title">
            {admins.map((user) => {
               return <UserListItem key={user.id} user={user} />;
            })}
            {admins.length === 0 && <ListItem>Ingen administratorer funnet</ListItem>}
         </List>
         <Heading as="h2" id="member-title" size="lg">
            Medlemmer
         </Heading>
         <List aria-labelledby="member-title">
            {members?.map((user) => {
               return <UserListItem key={user.id} user={user} />;
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
                     return <UserListItem key={user.id} user={user} />;
                  })}
                  {nonMembers?.length === 0 && <ListItem>Ingen andre brukere</ListItem>}
               </List>
               <ExternalUsersWithNoGataUser externalUsers={externalUsers} />
            </>
         )}
      </PageLayout>
   );
}
