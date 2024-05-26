import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { CircleUser, Trash } from "lucide-react";

import { getUser, getUserFromExternalUserId } from "~/.server/db/user";
import { getNotMemberUsers } from "~/api/auth0.api";
import { getContingentInfo } from "~/api/contingent.api";
import { getRoles } from "~/api/role.api";
import { useConfirmDialog } from "~/components/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { LinkExternalUserToGataUserSelect } from "~/routes/member.$memberId._index/components/LinkExternalUserToGataUserSelect";
import { UserInfo } from "~/routes/member.$memberId._index/components/UserInfo";
import { UserSubscribe } from "~/routes/member.$memberId._index/components/UserSubscribe";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { isAdmin } from "~/utils/roleUtils";
import { getPrimaryUser } from "~/utils/userUtils";

import { RoleButton } from "./components/RoleButton";
import { memberIntent } from "./intent";

export const loader = async ({ request, params: { memberId }, context }: LoaderFunctionArgs) => {
   const { accessToken: token, profile } = await createAuthenticator(context).getRequiredAuth(request);
   const signal = request.signal;

   if (!memberId) throw new Error("Member id required");
   if (!profile.id) throw new Error("Profile id required");

   const [member, loggedInUser, roles, contingentInfo, notMemberUsers] = await Promise.all([
      getUser(context, memberId),
      getUserFromExternalUserId(context, profile.id),
      getRoles({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
      getContingentInfo({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
      getNotMemberUsers({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
   ]);
   return { member, contingentInfo, roles, notMemberUsers, loggedInUser };
};

export const action = async ({ request, params: { memberId }, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const formData = await request.formData();
   const intent = String(formData.get("intent"));

   switch (intent) {
      case memberIntent.deleteUser: {
         await client(`user/${memberId}`, {
            method: "DELETE",
            token,
            baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
         });
         return redirect("/members");
      }
      case memberIntent.updateRole: {
         const roleId = String(formData.get("roleId"));
         await client(`role/${roleId}/user/${memberId}`, {
            method: request.method, // PUT or DELETE
            token,
            baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
         });
         return { ok: true };
      }
      case memberIntent.updateContingent: {
         const year = String(formData.get("year"));
         const hasPaid = String(formData.get("hasPaid"));
         const isPaid = !(hasPaid === "true");
         const body = { year, isPaid };
         await client(`user/${memberId}/contingent`, {
            method: "POST",
            body,
            token,
            baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
         });

         return { ok: true };
      }
      case memberIntent.updateLinkedUsers: {
         const userId = String(formData.get("userId"));
         const body = formData.getAll("externalUserId");
         await client(`user/${userId}/externaluserproviders`, {
            method: "PUT",
            body,
            token,
            baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
         });
         return { ok: true };
      }
      case memberIntent.updatePrimaryUserEmail: {
         const primaryUserEmail = String(formData.get("primaryUserEmail"));
         await client(`user/${memberId}/primaryuser`, {
            method: "PUT",
            body: primaryUserEmail,
            token,
            baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
         });
         return { ok: true };
      }
      case memberIntent.updateSubscribe: {
         await client(`user/${memberId}/subscribe`, {
            method: "PUT",
            token,
            baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
         });
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
               <AvatarImage src={getPrimaryUser(member).picture || undefined} />
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
