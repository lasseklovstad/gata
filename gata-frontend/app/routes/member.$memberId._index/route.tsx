import { Avatar, Box, Divider, Flex, Heading, IconButton, List, ListItem } from "@chakra-ui/react";
import { Delete } from "@mui/icons-material";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";

import { getNotMemberUsers } from "~/api/auth0.api";
import { getContingentInfo } from "~/api/contingent.api";
import { getRoles } from "~/api/role.api";
import { getLoggedInUser, getUser } from "~/api/user.api";
import { useConfirmDialog } from "~/components/ConfirmDialog";
import { LinkExternalUserToGataUserSelect } from "~/routes/member.$memberId._index/components/LinkExternalUserToGataUserSelect";
import { UserInfo } from "~/routes/member.$memberId._index/components/UserInfo";
import { UserSubscribe } from "~/routes/member.$memberId._index/components/UserSubscribe";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { isAdmin } from "~/utils/roleUtils";

import { RoleButton } from "./components/RoleButton";
import { memberIntent } from "./intent";

export const loader = async ({ request, params: { memberId }, context }: LoaderFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   const signal = request.signal;
   const [member, loggedInUser, roles, contingentInfo, notMemberUsers] = await Promise.all([
      getUser({ memberId, token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
      getLoggedInUser({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
      getRoles({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
      getContingentInfo({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
      getNotMemberUsers({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
   ]);
   return json({ member, contingentInfo, loggedInUser, roles, notMemberUsers });
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
         console.log({ userId, body });
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
   const { member, contingentInfo, loggedInUser, roles, notMemberUsers } = useLoaderData<typeof loader>();
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
         <Box display="flex" alignItems="center" mb={2}>
            <Avatar src={member.primaryUser.picture || undefined} sx={{ mr: 1 }} />
            <Heading as="h1" flex={1}>
               Informasjon
            </Heading>
            {isUserAdmin && (
               <>
                  <IconButton variant="ghost" onClick={openConfirmDialog} icon={<Delete />} aria-label="Slett" />
                  {ConfirmDialogComponent}
               </>
            )}
         </Box>
         {loggedInUser.id === member.id && <UserSubscribe user={member} />}
         <UserInfo user={member} loggedInUser={loggedInUser} contingentInfo={contingentInfo} />

         {isUserAdmin && (
            <>
               <LinkExternalUserToGataUserSelect user={member} notMemberUsers={notMemberUsers} />
               <Heading as="h2">Roller</Heading>
               <List>
                  {roles.map((role) => {
                     return (
                        <ListItem key={role.id}>
                           <Flex p={2} alignItems="center">
                              <Box flex={1}>{role.name}</Box>
                              <RoleButton role={role} user={member} />
                           </Flex>
                           <Divider />
                        </ListItem>
                     );
                  })}
               </List>
            </>
         )}
      </>
   );
}
