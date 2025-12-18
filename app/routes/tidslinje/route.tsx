import Map from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";
import { getUsers } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { Typography } from "~/components/ui/typography";
import { getRequiredUser } from "~/utils/auth.server";

import type { Route } from "./+types/route";
import { NewEvent } from "./NewEvent";

// logg inn på https://cloud.maptiler.com/

export const loader = async ({ request }: Route.LoaderArgs) => {
   const loggedInUser = await getRequiredUser(request);
   return {
      users: await getUsers(),
      loggedInUser,
   };
};

export const action = async ({ request, params }: Route.ActionArgs) => {};

export default function Timeline({ loaderData: { users, loggedInUser } }: Route.ComponentProps) {
   return (
      <PageLayout className="flex flex-col gap-4">
         <Typography variant="h1">GATA Tidslinje</Typography>
         <NewEvent users={users} />
         <Map
            initialViewState={{
               longitude: 10.7461,
               latitude: 59.9127,
               zoom: 5,
            }}
            style={{ width: "100%", height: "600px" }}
            mapStyle="https://api.maptiler.com/maps/base-v4/style.json?key=lLMSHC7KCVK6NsfkNcUu"
         />
      </PageLayout>
   );
}
