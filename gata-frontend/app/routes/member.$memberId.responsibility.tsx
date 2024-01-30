import { Accordion, Alert, AlertDescription, AlertTitle, Box, Button, Heading, Text } from "@chakra-ui/react";
import { Add } from "@mui/icons-material";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, Outlet } from "@remix-run/react";

import { isMember, isAdmin } from "~/old-app/components/useRoles";
import { ResponsibilityForm } from "~/old-app/pages/member/components/ResponsibilityForm";
import type { IGataUser } from "~/old-app/types/GataUser.type";
import type { IResponsibilityYear } from "~/old-app/types/ResponsibilityYear.type";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";

export const loader: LoaderFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   const loggedInUser = await client<IGataUser>("user/loggedin", { token });
   const member = await client<IGataUser>(`user/${params.memberId}`, { token });
   const responsibilityYears = await client<IResponsibilityYear[]>(`user/${params.memberId}/responsibilityyear`, {
      token,
   });
   return json<MemberResponsibilityLoaderData>({ loggedInUser, responsibilityYears, member });
};

export const action: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAuthToken(request);
   if (request.method === "POST") {
      const form = Object.fromEntries(await request.formData());
      await client(`user/${params.memberId}/responsibilityyear`, { method: "POST", body: form, token });
   }
   return redirect(`/member/${params.memberId}/responsibility`);
};

export interface MemberResponsibilityLoaderData {
   loggedInUser: IGataUser;
   responsibilityYears: IResponsibilityYear[];
   member: IGataUser;
}

export default function MemberResponsibility() {
   const { loggedInUser, responsibilityYears, member } = useLoaderData() as MemberResponsibilityLoaderData;

   if (!isMember(member)) {
      return (
         <Alert status="info">
            <AlertTitle>Brukeren er ikke medlem</AlertTitle>
            <AlertDescription>Du må være medlem av gata for å ha ansvarsposter</AlertDescription>
         </Alert>
      );
   }

   return (
      <>
         <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: "wrap" }}>
            <Heading as="h2" size="lg">
               Ansvarsposter
            </Heading>
            {isAdmin(loggedInUser) && (
               <Button leftIcon={<Add />} as={Link} to="new">
                  Legg til ansvarspost
               </Button>
            )}
         </Box>
         <Box>
            <Box boxShadow="md" rounded={4} bg="white">
               <Accordion allowToggle>
                  {responsibilityYears.map((responsibilityYear) => {
                     return (
                        <ResponsibilityForm
                           key={responsibilityYear.id}
                           responsibilityYear={responsibilityYear}
                           user={member}
                           loggedInUser={loggedInUser}
                        />
                     );
                  })}
               </Accordion>
            </Box>
            <Outlet />
            {responsibilityYears.length === 0 && <Text variant="body1">Ingen ansvarsposter lagt til.</Text>}
         </Box>
      </>
   );
}
