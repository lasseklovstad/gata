import { Accordion, Alert, AlertDescription, AlertTitle, Box, Button, Heading, Text } from "@chakra-ui/react";
import { Add } from "@mui/icons-material";
import { ActionFunction, json, Link, LoaderFunction, Outlet, redirect, useLoaderData } from "react-router-dom";

import { client } from "../../../api/client/client";
import { getRequiredAccessToken } from "../../../auth0Client";
import { isAdmin, isMember } from "../../../components/useRoles";
import { IGataUser } from "../../../types/GataUser.type";
import { IResponsibilityYear } from "../../../types/ResponsibilityYear.type";
import { ResponsibilityForm } from "../components/ResponsibilityForm";

export const memberResponsibilityLoader: LoaderFunction = async ({ request: { signal }, params }) => {
   const token = await getRequiredAccessToken();
   const loggedInUser = await client<IGataUser>("user/loggedin", { token, signal });
   const member = await client<IGataUser>(`user/${params.memberId}`, { token, signal });
   const responsibilityYears = await client<IResponsibilityYear[]>(`user/${params.memberId}/responsibilityyear`, {
      token,
      signal,
   });
   return json<MemberResponsibilityLoaderData>({ loggedInUser, responsibilityYears, member });
};

export const memberResponsibilityAction: ActionFunction = async ({ request, params }) => {
   const token = await getRequiredAccessToken();
   if (request.method === "POST") {
      const form = Object.fromEntries(await request.formData());
      await client(`user/${params.memberId}/responsibilityyear`, { method: "POST", body: form, token });
   }

   return redirect(`/member/${params.memberId}/responsibility`);
};

interface MemberResponsibilityLoaderData {
   loggedInUser: IGataUser;
   responsibilityYears: IResponsibilityYear[];
   member: IGataUser;
}

export const MemberResponsibility = () => {
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
};
