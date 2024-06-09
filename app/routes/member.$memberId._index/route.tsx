import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { CircleUser, Trash } from "lucide-react";

import { getContingentInfo, updateContingent } from "~/.server/db/contigent";
import { deleteRole, getRoles, insertRole } from "~/.server/db/role";
import {
   deleteUser,
   getNotMemberUsers,
   getUser,
   updateLinkedExternalUsers,
   updatePrimaryEmail,
   updateUserSubscribe,
} from "~/.server/db/user";
import { useConfirmDialog } from "~/components/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { LinkExternalUserToGataUserSelect } from "~/routes/member.$memberId._index/components/LinkExternalUserToGataUserSelect";
import { UserInfo } from "~/routes/member.$memberId._index/components/UserInfo";
import { UserSubscribe } from "~/routes/member.$memberId._index/components/UserSubscribe";
import { createAuthenticator } from "~/utils/auth.server";
import { badRequest } from "~/utils/responseUtils";
import { isAdmin, requireAdminRole } from "~/utils/roleUtils";

import { RoleButton } from "./components/RoleButton";
import { memberIntent } from "./intent";
import { updateContingentSchema } from "~/utils/formSchema";

export const loader = async ({ request, params: { memberId } }: LoaderFunctionArgs) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);

   if (!memberId) throw new Error("Member id required");

   const [member, roles, contingentInfo, notMemberUsers] = await Promise.all([
      getUser(memberId),
      getRoles(),
      getContingentInfo(),
      getNotMemberUsers(),
   ]);
   return { member, contingentInfo, roles, notMemberUsers, loggedInUser };
};

export const action = async ({ request, params: { memberId } }: ActionFunctionArgs) => {
   if (!memberId) {
      throw badRequest("Member id required");
   }
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const formData = await request.formData();
   const intent = String(formData.get("intent"));

   switch (intent) {
      case memberIntent.deleteUser: {
         requireAdminRole(loggedInUser);
         if (loggedInUser.id === memberId) {
            throw badRequest("Du kan ikke slette deg selv!");
         }
         await deleteUser(memberId);
         return redirect("/members");
      }
      case memberIntent.updateRole: {
         requireAdminRole(loggedInUser);
         const roleId = String(formData.get("roleId"));
         if (request.method === "DELETE") {
            await deleteRole(roleId, memberId);
         } else if (request.method === "POST") {
            await insertRole(roleId, memberId);
         }
         return { ok: true };
      }
      case memberIntent.updateContingent: {
         requireAdminRole(loggedInUser);
         const { amount, hasPaid, year } = updateContingentSchema.parse(formData);
         await updateContingent(memberId, year, hasPaid, amount);

         return { ok: true };
      }
      case memberIntent.updateLinkedUsers: {
         requireAdminRole(loggedInUser);
         const externalUserIds = formData.getAll("externalUserId").map(String);
         await updateLinkedExternalUsers(memberId, externalUserIds);
         return { ok: true };
      }
      case memberIntent.updatePrimaryUserEmail: {
         const primaryUserEmail = String(formData.get("primaryUserEmail"));
         await updatePrimaryEmail(memberId, primaryUserEmail);
         return { ok: true };
      }
      case memberIntent.updateSubscribe: {
         await updateUserSubscribe(memberId);
         return { ok: true };
      }
      default: {
         throw new Response(`Invalid intent "${intent}"`, { status: 400 });
      }
   }
};

export default function MemberInfoPage() {
   const { member, contingentInfo, roles, notMemberUsers, loggedInUser } = useLoaderData<typeof loader>();
   const fetcher = useFetcher();
   const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog({
      text: "Ved å slette mister vi all informasjon knyttet til brukeren",
      onConfirm: () => {
         fetcher.submit({ intent: memberIntent.deleteUser }, { method: "DELETE" });
      },
   });
   const isUserAdmin = isAdmin(loggedInUser);

   return (
      <>
         <div className="flex items-center mb-2 gap-2">
            <Avatar>
               <AvatarImage src={member.primaryUser.picture || undefined} />
               <AvatarFallback>
                  <CircleUser />
               </AvatarFallback>
            </Avatar>
            <Typography variant="h2" as="h1" className="flex-1">
               Informasjon
            </Typography>
            {isUserAdmin && (
               <>
                  <Button size="icon" variant="ghost" onClick={openConfirmDialog} aria-label="Slett">
                     <Trash />
                  </Button>
                  {ConfirmDialogComponent}
               </>
            )}
         </div>
         {loggedInUser.id === member.id && <UserSubscribe user={member} />}
         <UserInfo user={member} loggedInUser={loggedInUser} contingentInfo={contingentInfo} />

         {isUserAdmin && (
            <>
               <LinkExternalUserToGataUserSelect user={member} notMemberUsers={notMemberUsers} />
               <Typography variant="h2">Roller</Typography>
               <ul className="divide-y">
                  {roles.map((role) => {
                     return (
                        <li key={role.id} className="flex justify-between p-2 items-center">
                           {role.name}
                           <RoleButton role={role} user={member} />
                        </li>
                     );
                  })}
               </ul>
            </>
         )}
      </>
   );
}
