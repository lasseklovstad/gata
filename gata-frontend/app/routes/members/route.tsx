import { Box, Button, Heading, List, ListItem, Tooltip } from "@chakra-ui/react";
import { Email } from "@mui/icons-material";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { getNotMemberUsers } from "~/api/auth0.api";
import { getLoggedInUser, getUsers } from "~/api/user.api";
import { PageLayout } from "~/components/PageLayout";
import { ExternalUsersWithNoGataUser } from "~/routes/members/ExternalUsersWithNoGataUser";
import { UserListItem } from "~/routes/members/UserListItem";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { isAdmin } from "~/utils/roleUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const { signal } = request;
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const [loggedInUser, users, externalUsers] = await Promise.all([
      getLoggedInUser({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
      getUsers({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
      getNotMemberUsers({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
   ]);
   return { loggedInUser, users, externalUsers };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const form = Object.fromEntries(await request.formData());
   await client("user", { method: "POST", body: form, token, baseUrl: context.cloudflare.env.BACKEND_BASE_URL });
   return { ok: true };
};

export default function MemberPage() {
   const { loggedInUser, users, externalUsers } = useLoaderData<typeof loader>();

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
               <Tooltip label="Send påminnelse om betaling til de som ikke har betalt kontigent">
                  <Button as={Link} to="contingent" variant="ghost" leftIcon={<Email />} sx={{ mr: 1 }}>
                     Kontigent
                  </Button>
               </Tooltip>
            )}
         </Box>
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
         <Outlet />
      </PageLayout>
   );
}
