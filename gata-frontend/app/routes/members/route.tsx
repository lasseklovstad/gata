import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Mail } from "lucide-react";

import { getNotMemberUsers } from "~/api/auth0.api";
import { getLoggedInUser, getUsers } from "~/api/user.api";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Typography } from "~/components/ui/typography";
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
         <div className="flex justify-between items-center">
            <Typography variant="h1">Brukere</Typography>
            {isAdmin(loggedInUser) && (
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger asChild>
                        <Button as={Link} to="contingent">
                           <Mail className="mr-1" />
                           Kontigent
                        </Button>
                     </TooltipTrigger>
                     <TooltipContent>
                        <Typography>Send påminnelse om betaling til de som ikke har betalt kontigent</Typography>
                     </TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            )}
         </div>
         <Typography variant="h2" id="admin-title">
            Administratorer
         </Typography>
         <ul aria-labelledby="admin-title" className="divide-y">
            {admins.map((user) => {
               return <UserListItem key={user.id} user={user} isLoggedInUserAdmin={isAdmin(loggedInUser)} />;
            })}
            {admins.length === 0 && <li>Ingen administratorer funnet</li>}
         </ul>
         <Typography variant="h2" id="member-title">
            Medlemmer
         </Typography>
         <ul aria-labelledby="member-title" className="divide-y">
            {members?.map((user) => {
               return <UserListItem key={user.id} user={user} isLoggedInUserAdmin={isAdmin(loggedInUser)} />;
            })}
            {members.length === 0 && <li>Ingen medlemmer funnet</li>}
         </ul>
         {isAdmin(loggedInUser) && (
            <>
               <Typography variant="h2" id="non-member-title">
                  Ikke medlem
               </Typography>
               <ul aria-labelledby="non-member-title" className="divide-y">
                  {nonMembers?.map((user) => {
                     return <UserListItem key={user.id} user={user} isLoggedInUserAdmin={isAdmin(loggedInUser)} />;
                  })}
                  {nonMembers?.length === 0 && <li>Ingen andre brukere</li>}
               </ul>
               <ExternalUsersWithNoGataUser externalUsers={externalUsers} />
            </>
         )}
         <Outlet />
      </PageLayout>
   );
}
