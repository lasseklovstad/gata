import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";

import { getUser, getRequiredUserFromExternalUserId } from "~/.server/db/user";
import { getResponsibilityYears } from "~/api/user.api";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { ResponsibilityForm } from "~/routes/member.$memberId.responsibility/ResponsibilityForm";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { isAdmin, isMember } from "~/utils/roleUtils";

export const loader = async ({ request, params: { memberId }, context }: LoaderFunctionArgs) => {
   const { accessToken: token, profile } = await createAuthenticator(context).getRequiredAuth(request);
   const signal = request.signal;

   if (!memberId) throw new Error("Member id required");
   if (!profile.id) throw new Error("Profile id required");

   const [loggedInUser, member, responsibilityYears] = await Promise.all([
      getRequiredUserFromExternalUserId(context, profile.id),
      getUser(context, memberId),
      getResponsibilityYears({ memberId, token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
   ]);
   return json({ loggedInUser, responsibilityYears, member });
};

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   const token = await createAuthenticator(context).getRequiredAuthToken(request);
   if (request.method === "POST") {
      const form = Object.fromEntries(await request.formData());
      await client(`user/${params.memberId}/responsibilityyear`, {
         method: "POST",
         body: form,
         token,
         baseUrl: context.cloudflare.env.BACKEND_BASE_URL,
      });
   }
   return redirect(`/member/${params.memberId}/responsibility`);
};

export default function MemberResponsibility() {
   const { loggedInUser, responsibilityYears, member } = useLoaderData<typeof loader>();

   if (!isMember(member)) {
      return (
         <Alert>
            <AlertTitle>Brukeren er ikke medlem</AlertTitle>
            <AlertDescription>Du må være medlem av gata for å ha ansvarsposter</AlertDescription>
         </Alert>
      );
   }

   return (
      <>
         <div className="flex justify-between items-center flex-wrap">
            <Typography variant="h2">Ansvarsposter</Typography>
            {isAdmin(loggedInUser) && (
               <Button as={Link} to="new">
                  <Plus className="mr-2" />
                  Legg til ansvarspost
               </Button>
            )}
         </div>
         <div className="my-4">
            <div className="shadow rounded divide-y">
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
            </div>
            <Outlet />
            {responsibilityYears.length === 0 && <Typography>Ingen ansvarsposter lagt til.</Typography>}
         </div>
      </>
   );
}
