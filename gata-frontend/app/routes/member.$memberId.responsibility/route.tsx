import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Plus } from "lucide-react";
import { insertResponsibilityYear } from "~/.server/db/responsibility";

import { getResponsibilityYears, getUser } from "~/.server/db/user";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { ResponsibilityForm } from "~/routes/member.$memberId.responsibility/ResponsibilityForm";
import { createAuthenticator } from "~/utils/auth.server";
import { client } from "~/utils/client";
import { newResponsibilityYearSchema } from "~/utils/formSchema";
import { isAdmin, isMember } from "~/utils/roleUtils";

export const loader = async ({ request, params: { memberId }, context }: LoaderFunctionArgs) => {
   const loggedInUser = await createAuthenticator(context).getRequiredUser(request);

   if (!memberId) throw new Error("Member id required");

   const [member, responsibilityYears] = await Promise.all([
      getUser(context, memberId),
      getResponsibilityYears(context, memberId),
   ]);
   return { loggedInUser, responsibilityYears, member };
};

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
   if (!params.memberId) {
      throw new Error("Member id required");
   }
   const loggedInUser = await createAuthenticator(context).getRequiredUser(request);
   if (request.method === "POST") {
      const form = newResponsibilityYearSchema.parse(await request.formData());
      await insertResponsibilityYear(context, params.memberId, form.responsibilityId, form.year, loggedInUser);
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
