import { useState } from "react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { getUsers } from "~/.server/db/user";
import {
   deleteUserTimelineEvent,
   getAllUserTimelineEvents,
   getUserTimelineEvent,
   insertUserTimelineEvent,
   updateUserTimelineEvent,
} from "~/.server/db/userTimelineEvent";
import { PageLayout } from "~/components/PageLayout";
import { Typography } from "~/components/ui/typography";
import { cn } from "~/utils";
import { getRequiredUser } from "~/utils/auth.server";
import { badRequest, unauthorized } from "~/utils/responseUtils";
import { getIsTimelineAdmin } from "~/utils/roleUtils";
import { transformErrorResponse } from "~/utils/validateUtils";

import type { Route } from "./+types/route";
import { NewEvent } from "./NewEvent";
import { TimelineList } from "./TimelineList";
import { TimeLineMap } from "./TimelineMap";
import { TimelineTable } from "./TimelineTable";

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

const updateEventSchema = zfd
   .formData({
      intent: zfd.text(z.literal("updateEvent")),
      eventId: zfd.text(z.string().uuid({ message: "Ugyldig hendelse" })),
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
         throw badRequest("Invalid data");
      }

      const isTimelineAdmin = getIsTimelineAdmin(loggedInUser);

      if (!isTimelineAdmin) {
         throw unauthorized();
      }

      await updateUserTimelineEvent(eventId, { isVerified: isVerified === "true" });

      return { ok: true };
   }

   if (intent === "updateEvent") {
      const parsedForm = updateEventSchema.safeParse(formData);
      if (!parsedForm.success) {
         return transformErrorResponse(parsedForm.error);
      }

      const { eventId, date, type, place, longitude, latitude, description } = parsedForm.data;

      // Get the existing event to check permissions
      const timelineEvent = await getUserTimelineEvent(eventId);
      const canEdit = getIsTimelineAdmin(loggedInUser) || loggedInUser.id === timelineEvent.createdBy;

      if (!canEdit) {
         throw unauthorized();
      }

      await updateUserTimelineEvent(eventId, {
         eventType: type,
         eventDate: date,
         description,
         place: place || null,
         longitude: longitude || null,
         latitude: latitude || null,
         isVerified: getIsTimelineAdmin(loggedInUser),
      });

      return { ok: true };
   }

   if (intent === "deleteTimelineEvent") {
      const eventId = formData.get("eventId");

      if (typeof eventId !== "string") {
         throw badRequest("Invalid data");
      }
      const timelineEvent = await getUserTimelineEvent(eventId);
      const canDelete = getIsTimelineAdmin(loggedInUser) || loggedInUser.id === timelineEvent.createdBy;

      if (!canDelete) {
         throw unauthorized();
      }

      await deleteUserTimelineEvent(eventId);

      return { ok: true };
   }

   throw badRequest("Invalid intent");
};

export default function Timeline({ loaderData: { users, timelineEvents, loggedInUser } }: Route.ComponentProps) {
   const [activeTab, setActiveTab] = useState<"map" | "list" | "table">("map");
   const isTimelineAdmin = getIsTimelineAdmin(loggedInUser);

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
               <li className="-mb-[2px]">
                  <button
                     onClick={() => setActiveTab("table")}
                     className={`px-4 py-2 border-b-2 transition-colors ${
                        activeTab === "table"
                           ? "border-primary text-primary"
                           : "border-transparent text-muted-foreground hover:text-foreground"
                     }`}
                     aria-current={activeTab === "table" ? "page" : undefined}
                  >
                     Tabell
                  </button>
               </li>
            </ul>
         </nav>
         <div className={cn(activeTab !== "map" && "hidden")}>
            <TimeLineMap timelineEvents={timelineEvents} users={users} />
         </div>

         {/* List View */}
         {activeTab === "list" && (
            <TimelineList loggedInUser={loggedInUser} timelineEvents={timelineEvents} users={users} />
         )}

         {/* Table View */}
         {activeTab === "table" && (
            <TimelineTable loggedInUser={loggedInUser} timelineEvents={timelineEvents} users={users} />
         )}
      </PageLayout>
   );
}


