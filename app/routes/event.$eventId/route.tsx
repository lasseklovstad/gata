import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { useId } from "react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import {
   deleteEvent,
   getEvent,
   getEventParticipants,
   getNumberOfImages,
   updateEvent,
   updateIsUserParticipating,
   updateOrganizers,
} from "~/.server/db/gataEvent";
import { getUsers } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { TabNavLink } from "~/components/TabNavLink";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { isUserOrganizer } from "~/utils/gataEventUtils";
import { badRequest } from "~/utils/responseUtils";

import { AttendingSelect } from "./AttendingSelect";
import { EventMenu } from "./EventMenu";
import { EventOrganizers } from "./EventOrganizers";
import { eventSchema } from "./eventSchema";

const paramSchema = z.object({
   eventId: z.coerce.number(),
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const [event, users, numberOfImages, eventParticipants] = await Promise.all([
      getEvent(eventId),
      getUsers(),
      getNumberOfImages(eventId),
      getEventParticipants(eventId),
   ]);
   return { event, loggedInUser, users, numberOfImages, eventParticipants };
};

const organizersUpdateSchema = zfd.formData({
   organizers: zfd.repeatable(z.array(z.string())),
});

const updateParticipatingSchema = zfd.formData({
   status: zfd.text(z.enum(["going", "notGoing"])),
});

export const action = async ({ request, params }: ActionFunctionArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;

   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const formdata = await request.formData();
   const intent = formdata.get("intent") as string;

   if (intent === "updateParticipating") {
      const { status } = updateParticipatingSchema.parse(formdata);
      await updateIsUserParticipating(eventId, loggedInUser.id, status === "going");
      return { ok: true };
   }

   const event = await getEvent(eventId);
   if (!isUserOrganizer(event, loggedInUser)) {
      throw badRequest("Du har ikke tilgang til å endre denne ressursen");
   }

   if (intent === "deleteEvent") {
      await deleteEvent(eventId);
      return redirect("/home");
   }

   if (intent === "updateEvent") {
      const updateEventForm = eventSchema.safeParse(formdata);
      if (!updateEventForm.success) {
         return { ...updateEventForm.error.formErrors, ok: false };
      }
      const { startDate, startTime, description, title } = updateEventForm.data;
      await updateEvent(eventId, { title, description, startTime: startTime ?? null, startDate: startDate ?? null });
      return { ok: true };
   }
   if (intent === "updateOrganizers") {
      const { organizers } = organizersUpdateSchema.parse(formdata);
      if (organizers.length === 0) {
         throw badRequest("Det må være en arrangør");
      }
      if (!organizers.includes(loggedInUser.id)) {
         throw badRequest("Du kan ikke fjerne deg selv");
      }
      await updateOrganizers(eventId, organizers);
      return { ok: true };
   }

   throw badRequest("Intent not found " + intent);
};

export default function EventPage() {
   const { event, loggedInUser, users, numberOfImages, eventParticipants } = useLoaderData<typeof loader>();
   const descriptionTitleId = useId();
   const organizers = users.filter((user) => event.organizers.find((organizer) => organizer.userId === user.id));

   const isOrganizer = isUserOrganizer(event, loggedInUser);

   return (
      <PageLayout>
         <div className="flex justify-between items-center mb-4">
            <Typography variant="h1">{event.title}</Typography>
            {isOrganizer ? <EventMenu event={event} numberOfImages={numberOfImages} /> : null}
         </div>
         {isOrganizer ? <EventOrganizers users={users} organizers={organizers} /> : null}

         <div className="space-y-4">
            {organizers.length ? (
               <Typography variant="mutedText">
                  Arrangører: {organizers.map((user) => user.primaryUser.name).join(", ")}
               </Typography>
            ) : null}

            <section className="bg-slate-100 rounded p-2 border" aria-labelledby={descriptionTitleId}>
               <Typography variant="h4" as="h2" id={descriptionTitleId}>
                  Beskrivelse
               </Typography>
               <Typography className="mb-2">{event.description || "Ingen beskrivelse fra arrangør"}</Typography>
               {event.startDate ? (
                  <Typography>
                     Startdato:{" "}
                     <span className="font-semibold">
                        {formatDate(event.startDate, "iiii dd.MMMM.yyyy", { locale: nb })}
                     </span>
                  </Typography>
               ) : null}
               {event.startTime ? (
                  <Typography>
                     Tidspunkt: <span className="font-semibold">{event.startTime}</span>
                  </Typography>
               ) : null}
            </section>
            <AttendingSelect eventParticipants={eventParticipants} loggedInUser={loggedInUser} />
         </div>
         <nav className="border-b-2 mt-6">
            <ul className="flex">
               <li>
                  <TabNavLink to={""}>Aktivitet</TabNavLink>
               </li>
               <li>
                  <TabNavLink to="polls">Avstemninger</TabNavLink>
               </li>
               <li>
                  <TabNavLink to="images">Bilder ({numberOfImages})</TabNavLink>
               </li>
            </ul>
         </nav>
         <div className="my-4">
            <Outlet />
         </div>
      </PageLayout>
   );
}
