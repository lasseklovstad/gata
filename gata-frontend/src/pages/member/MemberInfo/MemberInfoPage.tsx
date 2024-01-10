import { Avatar, Box, Button, Divider, Flex, Heading, IconButton, List, ListItem } from "@chakra-ui/react";
import { Delete } from "@mui/icons-material";
import { ActionFunction, json, LoaderFunction, redirect, useFetcher, useLoaderData } from "react-router-dom";

import { UserSubscribe } from "./UserSubscribe";
import { client } from "../../../api/client/client";
import { getRequiredAccessToken } from "../../../auth0Client";
import { useConfirmDialog } from "../../../components/ConfirmDialog";
import { isAdmin } from "../../../components/useRoles";
import { IContingentInfo } from "../../../types/ContingentInfo.type";
import { IGataRole } from "../../../types/GataRole.type";
import { IExternalUser, IGataUser } from "../../../types/GataUser.type";
import { LinkExternalUserToGataUserSelect } from "../components/LinkExternalUserToGataUserSelect";
import { UserInfo } from "../components/UserInfo";

export const memberInfoPageLoader: LoaderFunction = async ({ request: { signal }, params }) => {
   const token = await getRequiredAccessToken();
   const member = await client<IGataUser>(`user/${params.memberId}`, { token, signal });
   const loggedInUser = await client<IGataUser>("user/loggedin", { token, signal });
   const roles = await client<IGataRole[]>("role", { token, signal });
   const contingentInfo = await client<IContingentInfo>("contingent", { token, signal });
   const notMemberUsers = await client<IExternalUser[]>("auth0user/nogatauser", { token, signal });
   return json<MemberInfoPageLoaderData>({ member, contingentInfo, loggedInUser, roles, notMemberUsers });
};

export const memberInfoPageAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();
   if (request.method === "DELETE") {
      await client(`user/${params.memberId}`, {
         method: "DELETE",
         token,
      });
      return redirect("/member");
   }
};

interface MemberInfoPageLoaderData {
   member: IGataUser;
   loggedInUser: IGataUser;
   contingentInfo: IContingentInfo;
   roles: IGataRole[];
   notMemberUsers: IExternalUser[];
}

export const MemberInfoPage = () => {
   const { member, contingentInfo, loggedInUser, roles, notMemberUsers } = useLoaderData() as MemberInfoPageLoaderData;
   const fetcher = useFetcher();
   const { openConfirmDialog, ConfirmDialogComponent } = useConfirmDialog({
      text: "Ved å slette fjernes all historikk for ansvarsposter og kontigent. Knytningen mellom en artikkel laget og brukeren blir også fjernet.",
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
};

export const memberRoleAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();
   const form = Object.fromEntries(await request.formData());
   if (request.method === "POST" || request.method === "DELETE") {
      await client(`role/${form.roleId}/user/${params.memberId}`, {
         method: request.method,
         token,
      });
      return { ok: true };
   }
};

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
