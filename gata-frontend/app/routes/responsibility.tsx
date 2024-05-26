import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Pencil, Plus, Trash } from "lucide-react";

import { getRequiredUserFromExternalUserId } from "~/.server/db/user";
import { getResponsibilities } from "~/api/responsibility.api";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { isAdmin } from "~/utils/roleUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const { accessToken: token, profile } = await createAuthenticator(context).getRequiredAuth(request);
   const signal = request.signal;
   if (!profile.id) throw new Error("Profile id required");
   const [loggedInUser, responsibilities] = await Promise.all([
      getRequiredUserFromExternalUserId(context, profile.id),
      getResponsibilities({ token, signal, baseUrl: context.cloudflare.env.BACKEND_BASE_URL }),
   ]);

   return json({ responsibilities, loggedInUser });
};

export default function ResponsibilityPage() {
   const { responsibilities, loggedInUser } = useLoaderData<typeof loader>();

   return (
      <PageLayout>
         <div className="flex justify-between items-center">
            <Typography variant="h1">Ansvarsposter</Typography>
            {isAdmin(loggedInUser) && (
               <Button as={Link} to="new">
                  <Plus className="mr-1" />
                  Legg til
               </Button>
            )}
         </div>
         <ul className="divide-y my-4">
            {responsibilities.map((resp) => {
               const { name, id, description } = resp;
               return (
                  <li key={id} className="p-2">
                     <div className="flex">
                        <div className="flex-grow">
                           <Typography variant="largeText">{name}</Typography>
                           <Typography variant="smallText" className="text-gray-500">
                              {description}
                           </Typography>
                        </div>
                        {isAdmin(loggedInUser) && (
                           <div className="flex items-center">
                              <Button
                                 size="icon"
                                 variant="ghost"
                                 as={Link}
                                 to={id}
                                 preventScrollReset
                                 aria-label="Rediger"
                              >
                                 <Pencil />
                              </Button>
                              <Button
                                 size="icon"
                                 variant="ghost"
                                 as={Link}
                                 to={`${id}/delete`}
                                 preventScrollReset
                                 aria-label="Slett"
                              >
                                 <Trash />
                              </Button>
                           </div>
                        )}
                     </div>
                  </li>
               );
            })}
            {responsibilities.length === 0 && <li>Ingen ansvarsposter, trykk legg til for å lage ny</li>}
         </ul>
         <Outlet />
      </PageLayout>
   );
}
