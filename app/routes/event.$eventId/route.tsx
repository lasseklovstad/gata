import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { useId } from "react";
import { Outlet, redirect } from "react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { updateEventAndNotify, updateParticipatingAndNotify } from "~/.server/data-layer/gataEvent";
import {
   deleteEvent,
   deleteImageLike,
   getEvent,
   getEventCoverImageByHearts,
   getEventParticipants,
   getNumberOfImages,
   insertImageLike,
   updateOrganizers,
} from "~/.server/db/gataEvent";
import { getUsers } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { TabNavLink } from "~/components/TabNavLink";
import { Typography } from "~/components/ui/typography";
import { getRequiredUser } from "~/utils/auth.server";
import { transformCloudflare } from "~/utils/file.utils";
import { isUserOrganizer } from "~/utils/gataEventUtils";
import { badRequest } from "~/utils/responseUtils";
import { transformErrorResponse } from "~/utils/validateUtils";

import type { Route } from "./+types/route";
import { AttendingSelect } from "./AttendingSelect";
import { EventMenu } from "./EventMenu";
import { EventOrganizers } from "./EventOrganizers";
import { eventSchema, likeImageSchema } from "../../utils/schemas/eventSchema";

export const meta = ({ data }: Route.MetaArgs) => {
   return [{ title: `${data.event.title} - Gata` }];
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
   const loggedInUser = await getRequiredUser(request);
   const eventId = z.coerce.number().parse(params.eventId);
   const [event, users, numberOfImages, eventParticipants, coverImage] = await Promise.all([
      getEvent(eventId),
      getUsers(),
      getNumberOfImages(eventId),
      getEventParticipants(eventId),
      getEventCoverImageByHearts(eventId),
   ]);
   return { event, loggedInUser, users, numberOfImages, eventParticipants, coverImage };
};

const organizersUpdateSchema = zfd.formData({
   organizers: zfd.repeatable(z.array(z.string())),
});

const updateParticipatingSchema = zfd.formData({
   status: zfd.text(z.enum(["going", "notGoing"]).optional()),
   subscribed: zfd.checkbox(),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
   const eventId = z.coerce.number().parse(params.eventId);
   const loggedInUser = await getRequiredUser(request);
   const formData = await request.formData();
   const intent = formData.get("intent") as string;
   const event = await getEvent(eventId);
   if (intent === "updateParticipating") {
      const { status, subscribed } = updateParticipatingSchema.parse(formData);
      await updateParticipatingAndNotify(loggedInUser, eventId, status, !subscribed);
      return { ok: true };
   }

   if (intent === "likeImage") {
      const { cloudId, type } = likeImageSchema.parse(formData);
      if (request.method === "POST") {
         await insertImageLike(loggedInUser.id, cloudId, type);
      } else {
         await deleteImageLike(loggedInUser.id, cloudId);
      }
      return { ok: true };
   }

   if (!isUserOrganizer(event, loggedInUser)) {
      throw badRequest("Du har ikke tilgang til å endre denne ressursen");
   }

   if (intent === "deleteEvent") {
      await deleteEvent(eventId);
      return redirect("/home");
   }

   if (intent === "updateEvent") {
      const updateEventForm = eventSchema.safeParse(formData);
      if (!updateEventForm.success) {
         return transformErrorResponse(updateEventForm.error);
      }
      // Notify all members when visibility is changed to everyone
      const shouldNotifyNewEvent = event.visibility !== "everyone" && updateEventForm.data.visibility === "everyone";
      await updateEventAndNotify(loggedInUser, eventId, updateEventForm.data, shouldNotifyNewEvent);
      return { ok: true };
   }
   if (intent === "updateOrganizers") {
      const { organizers } = organizersUpdateSchema.parse(formData);
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

export default function EventPage({
   loaderData: { event, loggedInUser, users, numberOfImages, eventParticipants, coverImage },
}: Route.ComponentProps) {
   const descriptionTitleId = useId();
   const organizers = users.filter((user) => event.organizers.find((organizer) => organizer.userId === user.id));
   const coverBackgroundImage =
      coverImage && !coverImage.type?.startsWith("video")
         ? `url(${transformCloudflare(coverImage.cloudUrl, 1600)})`
         : null;

   const isOrganizer = isUserOrganizer(event, loggedInUser);

   return (
      <PageLayout>
         <section className="relative mb-4 min-h-56 overflow-hidden rounded-xl border md:min-h-72">
            {coverBackgroundImage ? (
               <>
                  <div
                     className="absolute inset-0 bg-cover bg-center"
                     style={{ backgroundImage: coverBackgroundImage }}
                     aria-hidden
                  />
                  <div
                     className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/45"
                     aria-hidden
                  />
               </>
            ) : (
               <div
                  className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800"
                  aria-hidden
               />
            )}

            <div className="relative z-10 flex min-h-56 items-start justify-between p-4 text-white md:min-h-72 md:p-6">
               <Typography variant="h1" className="text-white drop-shadow-sm">
                  {event.title}
               </Typography>
               {isOrganizer ? <EventMenu event={event} numberOfImages={numberOfImages} /> : null}
            </div>
         </section>

         {isOrganizer ? <EventOrganizers users={users} organizers={organizers} /> : null}

         <div className="space-y-4">
            {organizers.length ? (
               <Typography variant="mutedText">Arrangører: {organizers.map((user) => user.name).join(", ")}</Typography>
            ) : null}

            <section className="bg-slate-100 rounded p-2 border" aria-labelledby={descriptionTitleId}>
               <Typography variant="h4" as="h2" id={descriptionTitleId}>
                  Beskrivelse
               </Typography>
               <Typography className="mb-2 whitespace-pre-wrap">
                  {event.description || "Ingen beskrivelse fra arrangør"}
               </Typography>
               {event.startDate ? (
                  <Typography>
                     Startdato:{" "}
                     <span className="font-semibold">{formatDate(event.startDate, "PPPP", { locale: nb })}</span>
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
                  <TabNavLink to="">Aktivitet</TabNavLink>
               </li>
               <li>
                  <TabNavLink to="polls">Avstemninger</TabNavLink>
               </li>
               <li>
                  <TabNavLink to="images">Media ({numberOfImages})</TabNavLink>
               </li>
            </ul>
         </nav>
         <div className="my-4">
            <Outlet />
         </div>
      </PageLayout>
   );
}
