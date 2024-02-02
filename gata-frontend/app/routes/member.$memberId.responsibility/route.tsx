import { Accordion, Alert, AlertDescription, AlertTitle, Box, Button, Heading, Text } from "@chakra-ui/react";
import { Add } from "@mui/icons-material";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { getLoggedInUser, getResponsibilityYears, getUser } from "~/api/user.api";
import { ResponsibilityForm } from "~/routes/member.$memberId.responsibility/ResponsibilityForm";
import { getRequiredAuthToken } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { isAdmin, isMember } from "~/utils/roleUtils";

export const loader = async ({ request, params: { memberId } }: LoaderFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   const signal = request.signal;
   const [loggedInUser, member, responsibilityYears] = await Promise.all([
      getLoggedInUser({ token, signal }),
      getUser({ memberId, token, signal }),
      getResponsibilityYears({ memberId, token, signal }),
   ]);
   return json({ loggedInUser, responsibilityYears, member });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const token = await getRequiredAuthToken(request);
   if (request.method === "POST") {
      const form = Object.fromEntries(await request.formData());
      await client(`user/${params.memberId}/responsibilityyear`, { method: "POST", body: form, token });
   }
   return redirect(`/member/${params.memberId}/responsibility`);
};

export default function MemberResponsibility() {
   const { loggedInUser, responsibilityYears, member } = useLoaderData<typeof loader>();

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
