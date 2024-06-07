import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Mail } from "lucide-react";

import { deleteExternalUser, getNotMemberUsers, getUsers, insertUser } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Typography } from "~/components/ui/typography";
import { useRootLoader } from "~/root";
import { ExternalUsersWithNoGataUser } from "~/routes/members/ExternalUsersWithNoGataUser";
import { UserListItem } from "~/routes/members/UserListItem";
import { createAuthenticator } from "~/utils/auth.server";
import { isAdmin, isMember } from "~/utils/roleUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   await createAuthenticator(context).getRequiredUser(request);
   const [users, externalUsers] = await Promise.all([getUsers(context), getNotMemberUsers(context)]);
   return { users, externalUsers };
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
   const loggedInUser = await createAuthenticator(context).getRequiredUser(request);
   if (!isAdmin(loggedInUser)) {
      throw new Error("Du har ikke tilgang");
   }
   const form = await request.formData();
   const externalUserId = String(form.get("externalUserId"));
   if (request.method === "POST") {
      await insertUser(context, externalUserId);
      return { ok: true };
   }
   if (request.method === "DELETE") {
      await deleteExternalUser(context, externalUserId);
      return { ok: true };
   }
};

export default function MemberPage() {
   const { users, externalUsers } = useLoaderData<typeof loader>();
   const { loggedInUser } = useRootLoader();

   const admins = users.filter(isAdmin);
   const members = users.filter((user) => isMember(user) && !isAdmin(user));
   const nonMembers = users.filter((user) => !isMember(user) && !isAdmin(user));

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
            {members.map((user) => {
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
                  {nonMembers.map((user) => {
                     return <UserListItem key={user.id} user={user} isLoggedInUserAdmin={isAdmin(loggedInUser)} />;
                  })}
                  {nonMembers.length === 0 && <li>Ingen andre brukere</li>}
               </ul>
               <ExternalUsersWithNoGataUser externalUsers={externalUsers} />
            </>
         )}
         <Outlet />
      </PageLayout>
   );
}
