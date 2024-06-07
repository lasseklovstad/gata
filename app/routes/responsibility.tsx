import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Pencil, Plus, Trash } from "lucide-react";

import { getResponsibilities } from "~/.server/db/responsibility";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { isAdmin } from "~/utils/roleUtils";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
   const loggedInUser = await createAuthenticator(context).getRequiredUser(request);
   const [responsibilities] = await Promise.all([getResponsibilities(context)]);

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
