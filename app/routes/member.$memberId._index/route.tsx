import { Trash } from "lucide-react";
import { redirect, useFetcher } from "react-router";

import { getContingentInfo, updateContingent } from "~/.server/db/contigent";
import { deleteRole, getRoles, insertRole } from "~/.server/db/role";
import {
   deleteUser,
   getNotMemberUsers,
   getUser,
   updateLinkedExternalUsers,
   updatePrimaryEmail,
} from "~/.server/db/user";
import { AvatarUserButton } from "~/components/AvatarUser";
import { useConfirmDialog } from "~/components/ConfirmDialog";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { LinkExternalUserToGataUserSelect } from "~/routes/member.$memberId._index/components/LinkExternalUserToGataUserSelect";
import { UserInfo } from "~/routes/member.$memberId._index/components/UserInfo";
import { getRequiredUser } from "~/utils/auth.server";
import { badRequest } from "~/utils/responseUtils";
import { isAdmin, requireAdminRole } from "~/utils/roleUtils";

import type { Route } from "./+types/route";
import { RoleButton } from "./components/RoleButton";
import { MemberActionSchema, memberIntent } from "./intent";

export const loader = async ({ request, params: { memberId } }: Route.LoaderArgs) => {
   const loggedInUser = await getRequiredUser(request);
   const [member, roles, contingentInfo, notMemberUsers] = await Promise.all([
      getUser(memberId),
      getRoles(),
      getContingentInfo(),
      getNotMemberUsers(),
   ]);
   return { member, contingentInfo, roles, notMemberUsers, loggedInUser };
};

export const action = async ({ request, params: { memberId } }: Route.ActionArgs) => {
   const loggedInUser = await getRequiredUser(request);
   const result = MemberActionSchema.safeParse(await request.formData());

   if (!result.success) {
      throw new Response(`Feil ved validering av skjema`, { status: 400 });
   }

   const form = result.data;

   switch (form.intent) {
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
         if (request.method === "DELETE") {
            await deleteRole(form.roleId, memberId);
         } else if (request.method === "POST") {
            await insertRole(form.roleId, memberId);
         }
         return { ok: true };
      }
      case memberIntent.updateContingent: {
         requireAdminRole(loggedInUser);
         const { amount, hasPaid, year } = form;
         await updateContingent(memberId, year, hasPaid, amount);

         return { ok: true };
      }
      case memberIntent.updateLinkedUsers: {
         requireAdminRole(loggedInUser);
         await updateLinkedExternalUsers(memberId, form.externalUserId);
         return { ok: true };
      }
      case memberIntent.updatePrimaryUserEmail: {
         await updatePrimaryEmail(memberId, form.primaryUserEmail);
         return { ok: true };
      }
   }
};

export default function MemberInfoPage({
   loaderData: { member, contingentInfo, roles, notMemberUsers, loggedInUser },
}: Route.ComponentProps) {
   const fetcher = useFetcher<typeof action>();
   const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog({
      text: "Ved å slette mister vi all informasjon knyttet til brukeren",
      onConfirm: async () => {
         await fetcher.submit({ intent: memberIntent.deleteUser }, { method: "DELETE" });
      },
   });
   const isUserAdmin = isAdmin(loggedInUser);

   return (
      <>
         <div className="flex items-center mb-2 gap-2">
            <AvatarUserButton user={member} />
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
