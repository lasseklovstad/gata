import { useState } from "react";
import Map from "react-map-gl/maplibre";
import { Form, useNavigation } from "react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";

import "maplibre-gl/dist/maplibre-gl.css";
import { getUsers } from "~/.server/db/user";
import {
   getAllUserTimelineEvents,
   insertUserTimelineEvent,
   updateUserTimelineEvent,
} from "~/.server/db/userTimelineEvent";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { cn } from "~/utils";
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
      place: zfd.text().optional(),
      longitude: zfd.numeric().optional(),
      latitude: zfd.numeric().optional(),
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

      const isTimelineAdmin = !!loggedInUser.responsibilityYears.find(
         (responsibilityYear) => responsibilityYear.responsibility.name === "Oversiktsansvarlig"
      );

      await insertUserTimelineEvent({
         userId,
         eventType: type,
         eventDate: date,
         description,
         place: place || null,
         longitude: longitude || null,
         latitude: latitude || null,
         isVerified: isTimelineAdmin,
         createdBy: loggedInUser.id,
      });

      return { ok: true };
   }

   if (intent === "toggleVerify") {
      const eventId = formData.get("eventId");
      const isVerified = formData.get("isVerified");

      if (typeof eventId !== "string" || typeof isVerified !== "string") {
         return { ok: false, error: "Invalid data" };
      }

      const isTimelineAdmin = !!loggedInUser.responsibilityYears.find(
         (responsibilityYear) => responsibilityYear.responsibility.name === "Oversiktsansvarlig"
      );

      if (!isTimelineAdmin) {
         return { ok: false, error: "Unauthorized" };
      }

      await updateUserTimelineEvent(eventId, { isVerified: isVerified === "true" });

      return { ok: true };
   }

   return { ok: false };
};

export default function Timeline({ loaderData: { users, timelineEvents, loggedInUser } }: Route.ComponentProps) {
   const [activeTab, setActiveTab] = useState<"map" | "list">("map");
   const navigation = useNavigation();
   const isTimelineAdmin = !!loggedInUser.responsibilityYears.find(
      (responsibilityYear) => responsibilityYear.responsibility.name === "Oversiktsansvarlig"
   );
   // Sort events by date, newest first
   const sortedEvents = [...timelineEvents].sort((a, b) => {
      return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
   });

   // Event type labels
   const eventTypeLabels: Record<string, string> = {
      "civil-status": "Sivilstatus",
      home: "Bosted",
      work: "Arbeid",
   };

   return (
      <PageLayout className="flex flex-col gap-4">
         <Typography variant="h1">GATA Tidslinje</Typography>
         <NewEvent users={isTimelineAdmin ? users : [loggedInUser]} />

         {/* Tab Navigation */}
         <nav className="border-b-2">
            <ul className="flex">
               <li className="-mb-[2px]">
                  <button
                     onClick={() => setActiveTab("map")}
                     className={`px-4 py-2 border-b-2 transition-colors ${
                        activeTab === "map"
                           ? "border-primary text-primary"
                           : "border-transparent text-muted-foreground hover:text-foreground"
                     }`}
                     aria-current={activeTab === "map" ? "page" : undefined}
                  >
                     Kart
                  </button>
               </li>
               <li className="-mb-[2px]">
                  <button
                     onClick={() => setActiveTab("list")}
                     className={`px-4 py-2 border-b-2 transition-colors ${
                        activeTab === "list"
                           ? "border-primary text-primary"
                           : "border-transparent text-muted-foreground hover:text-foreground"
                     }`}
                     aria-current={activeTab === "list" ? "page" : undefined}
                  >
                     Liste
                  </button>
               </li>
            </ul>
         </nav>
         <div className={cn(activeTab !== "map" && "hidden")}>
            <Map
               initialViewState={{
                  longitude: 10.7461,
                  latitude: 59.9127,
                  zoom: 5,
               }}
               style={{ width: "100%", height: "600px" }}
               mapStyle="https://api.maptiler.com/maps/base-v4/style.json?key=lLMSHC7KCVK6NsfkNcUu"
            />
         </div>

         {/* List View */}
         {activeTab === "list" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {sortedEvents.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                     <Typography variant="mutedText">Ingen hendelser registrert ennå</Typography>
                  </div>
               ) : (
                  sortedEvents.map((event) => {
                     const user = users.find((u) => u.id === event.userId);
                     if (!user) {
                        throw new Error("Could not find user!");
                     }
                     return (
                        <div
                           key={event.id}
                           className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                           <div className="flex justify-between items-start mb-2">
                              <Typography variant="h4">{eventTypeLabels[event.eventType]}</Typography>
                              <div className="flex items-center gap-2">
                                 {event.isVerified ? (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                       Verifisert
                                    </span>
                                 ) : (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                       Ikke Verifisert
                                    </span>
                                 )}
                              </div>
                           </div>
                           <div className="space-y-2">
                              <div>
                                 <Typography variant="smallText" className="text-muted-foreground">
                                    Dato
                                 </Typography>
                                 <Typography variant="p">
                                    {new Date(event.eventDate).toLocaleDateString("nb-NO", {
                                       year: "numeric",
                                       month: "long",
                                       day: "numeric",
                                    })}
                                 </Typography>
                              </div>
                              <div>
                                 <Typography variant="smallText" className="text-muted-foreground">
                                    Person
                                 </Typography>
                                 <Typography variant="p">{user.name}</Typography>
                              </div>
                              {event.place && (
                                 <div>
                                    <Typography variant="smallText" className="text-muted-foreground">
                                       Sted
                                    </Typography>
                                    <Typography variant="p">{event.place}</Typography>
                                 </div>
                              )}
                              {event.description && (
                                 <div>
                                    <Typography variant="smallText" className="text-muted-foreground">
                                       Beskrivelse
                                    </Typography>
                                    <Typography variant="p">{event.description}</Typography>
                                 </div>
                              )}
                              {isTimelineAdmin && (
                                 <Form method="post">
                                    <input type="hidden" name="intent" value="toggleVerify" />
                                    <input type="hidden" name="eventId" value={event.id} />
                                    <input type="hidden" name="isVerified" value={(!event.isVerified).toString()} />
                                    <Button
                                       type="submit"
                                       disabled={
                                          navigation.state === "submitting" &&
                                          navigation.formData?.get("eventId") === event.id
                                       }
                                       variant={event.isVerified ? "ghost" : "default"}
                                       size="sm"
                                    >
                                       {event.isVerified ? "Fjern verifisering" : "Verifiser"}
                                    </Button>
                                 </Form>
                              )}
                           </div>
                        </div>
                     );
                  })
               )}
            </div>
         )}
      </PageLayout>
   );
}
