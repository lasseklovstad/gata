import Map from "react-map-gl/maplibre";
import { z } from "zod";
import { zfd } from "zod-form-data";

import "maplibre-gl/dist/maplibre-gl.css";
import { getUsers } from "~/.server/db/user";
import { getAllUserTimelineEvents, insertUserTimelineEvent } from "~/.server/db/userTimelineEvent";
import { PageLayout } from "~/components/PageLayout";
import { Typography } from "~/components/ui/typography";
import { getRequiredUser } from "~/utils/auth.server";
import { transformErrorResponse } from "~/utils/validateUtils";

import type { Route } from "./+types/route";
import { NewEvent } from "./NewEvent";

// logg inn på https://cloud.maptiler.com/

const newEventSchema = zfd
   .formData({
      intent: zfd.text(z.literal("newEvent")),
      user: zfd.text(z.string().uuid({ message: "Ugyldig bruker" })),
      date: zfd.text(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Ugyldig dato" })),
      type: zfd.text(
         z.enum(["civil-status", "home", "work"], {
            message: "Velg en gyldig type",
         })
      ),
      place: zfd.text(z.string().optional()),
      longitude: zfd.numeric(),
      latitude: zfd.numeric(),
      description: zfd.text(z.string().default("")),
   })
   .refine(
      (data) => {
         if (data.type === "home") {
            return data.place && data.longitude && data.latitude;
         }
         return true;
      },
      {
         message: 'Sted, lengdegrad og breddegrad er påkrevd når type er "home"',
         path: ["place"],
      }
   );

export const loader = async ({ request }: Route.LoaderArgs) => {
   const loggedInUser = await getRequiredUser(request);
   return {
      users: await getUsers(),
      loggedInUser,
      timelineEvents: await getAllUserTimelineEvents(),
   };
};

export const action = async ({ request }: Route.ActionArgs) => {
   const loggedInUser = await getRequiredUser(request);
   const formData = await request.formData();
   const intent = formData.get("intent");

   if (intent === "newEvent") {
      const parsedForm = newEventSchema.safeParse(formData);
      if (!parsedForm.success) {
         return transformErrorResponse(parsedForm.error);
      }

      const { user: userId, date, type, place, longitude, latitude, description } = parsedForm.data;

      await insertUserTimelineEvent({
         userId,
         eventType: type,
         eventDate: date,
         description,
         place: place || null,
         longitude: longitude || null,
         latitude: latitude || null,
         isVerified: false,
         createdBy: loggedInUser.id,
      });

      return { ok: true };
   }

   return { ok: false };
};

export default function Timeline({ loaderData: { users } }: Route.ComponentProps) {
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
