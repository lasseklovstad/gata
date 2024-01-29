import { Avatar, Box, Button, Divider, Flex, Heading, IconButton, List, ListItem } from "@chakra-ui/react";
import { Delete } from "@mui/icons-material";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";

import { client } from "~/utils/client";
import { useConfirmDialog } from "~/old-app/components/ConfirmDialog";
import { isAdmin } from "~/old-app/components/useRoles";
import { LinkExternalUserToGataUserSelect } from "~/old-app/pages/member/components/LinkExternalUserToGataUserSelect";
import { UserInfo } from "~/old-app/pages/member/components/UserInfo";
import { UserSubscribe } from "~/old-app/pages/member/MemberInfo/UserSubscribe";
import type { IContingentInfo } from "~/old-app/types/ContingentInfo.type";
import type { IGataRole } from "~/old-app/types/GataRole.type";
import type { IGataUser, IExternalUser } from "~/old-app/types/GataUser.type";
import { getRequiredAuthToken } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const member = await client<IGataUser>(`user/${params.memberId}`, { token });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token });
   const roles = await client<IGataRole[]>("role", { token });
   const contingentInfo = await client<IContingentInfo>("contingent", { token });
   const notMemberUsers = await client<IExternalUser[]>("auth0user/nogatauser", { token });
   return json<MemberInfoPageLoaderData>({ member, contingentInfo, loggedInUser, roles, notMemberUsers });
};

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   if (request.method === "DELETE") {
      await client(`user/${params.memberId}`, {
         method: "DELETE",
         token,
      });
      return redirect("/members");
   }
};

interface MemberInfoPageLoaderData {
   member: IGataUser;
   loggedInUser: IGataUser;
   contingentInfo: IContingentInfo;
   roles: IGataRole[];
   notMemberUsers: IExternalUser[];
}

export default function MemberInfoPage() {
   const { member, contingentInfo, loggedInUser, roles, notMemberUsers } = useLoaderData() as MemberInfoPageLoaderData;
   const fetcher = useFetcher();
   const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog({
      text: "Ved å slette mister vi all informasjon knyttet til brukeren",
      onConfirm: () => {
         fetcher.submit(null, { method: "delete" });
      },
   });

   return (
      <>
         <Box display="flex" alignItems="center">
            <Avatar src={member.primaryUser.picture || undefined} sx={{ mr: 1 }} />
            <Heading as="h1" flex={1}>
               Informasjon
            </Heading>
            {isAdmin(loggedInUser) && (
               <>
                  <IconButton variant="ghost" onClick={openConfirmDialog} icon={<Delete />} aria-label="Slett" />
                  {ConfirmDialogComponent}
               </>
            )}
         </Box>
         {loggedInUser.id === member.id && <UserSubscribe user={member} />}
         <UserInfo user={member} loggedInUser={loggedInUser} contingentInfo={contingentInfo} />

         {isAdmin(loggedInUser) && <LinkExternalUserToGataUserSelect user={member} notMemberUsers={notMemberUsers} />}
         <Heading as="h2">Roller</Heading>
         <List>
            {roles.map((role) => {
               return (
                  <ListItem key={role.id}>
                     <Flex p={2} alignItems="center">
                        <Box flex={1}>{role.name}</Box>
                        {isAdmin(loggedInUser) && <RoleButton role={role} user={member} />}
                     </Flex>
                     <Divider />
                  </ListItem>
               );
            })}
         </List>
      </>
   );
}

type RoleButtonProps = {
   role: IGataRole;
   user: IGataUser;
};

const RoleButton = ({ role, user }: RoleButtonProps) => {
   const hasRole = !!user.roles.find((r) => r.name === role.name);
   const fetcher = useFetcher();
   return (
      <fetcher.Form method={hasRole ? "delete" : "post"} action="role">
         <input readOnly hidden value={role.id} name="roleId" />
         <Button variant="outline" type="submit" isLoading={fetcher.state !== "idle"}>
            {hasRole ? "Fjern rolle" : "Legg til rolle"}
         </Button>
      </fetcher.Form>
   );
};
