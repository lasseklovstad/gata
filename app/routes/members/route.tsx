import { Mail } from "lucide-react";
import { Link, Outlet } from "react-router";
import { zfd } from "zod-form-data";

import { getAllSubscriptions } from "~/.server/db/pushSubscriptions";
import { deleteExternalUser, getNotMemberUsers, getUsers, insertUser } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Typography } from "~/components/ui/typography";
import { ExternalUsersWithNoGataUser } from "~/routes/members/ExternalUsersWithNoGataUser";
import { UserListItem } from "~/routes/members/UserListItem";
import { getRequiredUser } from "~/utils/auth.server";
import { isAdmin, isMember, RoleName } from "~/utils/roleUtils";

import type { Route } from "./+types/route";

export const meta = () => {
   return [{ title: "Medlemmer - Gata" }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
   const loggedInUser = await getRequiredUser(request);
   const [users, externalUsers, subscriptions] = await Promise.all([
      getUsers(),
      getNotMemberUsers(),
      getAllSubscriptions(""),
   ]);
   return { users, externalUsers, subscriptions: subscriptions.map((s) => s.userId), loggedInUser };
};

const MembersActionSchema = zfd.formData({
   externalUserId: zfd.text(),
});

export const action = async ({ request }: Route.ActionArgs) => {
   await getRequiredUser(request, [RoleName.Admin]);
   const { externalUserId } = MembersActionSchema.parse(await request.formData());
   if (request.method === "POST") {
      await insertUser(externalUserId);
      return { ok: true };
   }
   if (request.method === "DELETE") {
      await deleteExternalUser(externalUserId);
      return { ok: true };
   }
};

export default function MemberPage({
   loaderData: { users, externalUsers, subscriptions, loggedInUser },
}: Route.ComponentProps) {
   const admins = users.filter(isAdmin);
   const members = users.filter((user) => isMember(user) && !isAdmin(user));
   const nonMembers = users.filter((user) => !isMember(user) && !isAdmin(user));
   const userIsAdmin = isAdmin(loggedInUser);

   return (
      <PageLayout>
         <div className="flex justify-between items-center">
            <Typography variant="h1">Brukere</Typography>
            {userIsAdmin && (
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
               return (
                  <UserListItem
                     key={user.id}
                     user={user}
                     isLoggedInUserAdmin={userIsAdmin}
                     isPushSubscribed={subscriptions.includes(user.id)}
                  />
               );
            })}
            {admins.length === 0 && <li>Ingen administratorer funnet</li>}
         </ul>
         <Typography variant="h2" id="member-title">
            Medlemmer
         </Typography>
         <ul aria-labelledby="member-title" className="divide-y">
            {members.map((user) => {
               return (
                  <UserListItem
                     key={user.id}
                     user={user}
                     isLoggedInUserAdmin={userIsAdmin}
                     isPushSubscribed={subscriptions.includes(user.id)}
                  />
               );
            })}
            {members.length === 0 && <li>Ingen medlemmer funnet</li>}
         </ul>
         {userIsAdmin && (
            <>
               <Typography variant="h2" id="non-member-title">
                  Ikke medlem
               </Typography>
               <ul aria-labelledby="non-member-title" className="divide-y">
                  {nonMembers.map((user) => {
                     return (
                        <UserListItem
                           key={user.id}
                           user={user}
                           isLoggedInUserAdmin={userIsAdmin}
                           isPushSubscribed={subscriptions.includes(user.id)}
                        />
                     );
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
