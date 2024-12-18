import { Pencil, Plus, Trash } from "lucide-react";
import { Link, Outlet } from "react-router";

import { getResponsibilitiesWithCurrentlyResponsibleUsername } from "~/.server/db/responsibility";
import { PageLayout } from "~/components/PageLayout";
import { Button, ButtonResponsive } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { getRequiredUser } from "~/utils/auth.server";
import { isAdmin } from "~/utils/roleUtils";

import type { Route } from "./+types/responsibility";

export const meta = () => {
   return [{ title: "Ansvarsposter - Gata" }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
   const loggedInUser = await getRequiredUser(request);
   const [responsibilities] = await Promise.all([getResponsibilitiesWithCurrentlyResponsibleUsername()]);

   return { responsibilities, loggedInUser };
};

export default function ResponsibilityPage({ loaderData: { responsibilities, loggedInUser } }: Route.ComponentProps) {
   return (
      <PageLayout>
         <div className="flex justify-between items-center">
            <Typography variant="h1">Ansvarsposter</Typography>
            {isAdmin(loggedInUser) && <ButtonResponsive as={Link} to="new" icon={<Plus />} label="Legg til" />}
         </div>
         <ul className="divide-y my-4">
            {responsibilities.map((resp) => {
               const { name, id, description, responsibilityYears } = resp;
               const usernames = responsibilityYears.map((responsibilityYear) => responsibilityYear.user.name);
               return (
                  <li key={id} className="p-2">
                     <div className="flex">
                        <div className="flex-grow flex flex-col">
                           <Typography variant="largeText">{name}</Typography>
                           <Typography variant="smallText" className="mb-2">
                              Ansvarlig: {usernames.length ? usernames.sort().join(", ") : "Ingen"}
                           </Typography>
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
