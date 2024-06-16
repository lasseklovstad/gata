import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { deleteEvent, getEvent, getNumberOfImages, updateEvent, updateOrganizers } from "~/.server/db/gataEvent";
import { getUsers } from "~/.server/db/user";
import { PageLayout } from "~/components/PageLayout";
import { TabNavLink } from "~/components/TabNavLink";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { isUserOrganizer } from "~/utils/gataEventUtils";
import { badRequest } from "~/utils/responseUtils";

import { EventMenu } from "./EventMenu";
import { EventOrganizers } from "./EventOrganizers";

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
   const [event, users, numberOfImages] = await Promise.all([
      getEvent(eventId),
      getUsers(),
      getNumberOfImages(eventId),
   ]);
   return { event, loggedInUser, users, numberOfImages };
};

const eventUpdateSchema = zfd.formData({
   title: zfd.text(z.string()),
   description: zfd.text(z.string().default("")),
   startDate: zfd.text(z.string().date().optional()),
   startTime: zfd.text(
      z
         .string()
         .regex(/\d{2}:\d{2}/)
         .optional()
   ),
});
const organizersUpdateSchema = zfd.formData({
   organizers: zfd.repeatable(z.array(z.string())),
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

   const event = await getEvent(eventId);
   if (!isUserOrganizer(event, loggedInUser)) {
      throw badRequest("Du har ikke tilgang til å endre denne ressursen");
   }

   if (intent === "deleteEvent") {
      await deleteEvent(eventId);
      return redirect("/home");
   }

   if (intent === "updateEvent") {
      const updateEventForm = eventUpdateSchema.safeParse(formdata);
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
   const { event, loggedInUser, users, numberOfImages } = useLoaderData<typeof loader>();

   const organizers = users.filter((user) => event.organizers.find((organizer) => organizer.userId === user.id));

   const isOrganizer = isUserOrganizer(event, loggedInUser);
   return (
      <PageLayout>
         <div className="flex justify-between items-center mb-4">
            <Typography variant="h1">{event.title}</Typography>
            {isOrganizer ? <EventMenu event={event} numberOfImages={numberOfImages} /> : null}
         </div>
         <Typography variant="mutedText">
            Opprettet av {event.createdByUser?.primaryUser.name ?? "Ukjent bruker"}
         </Typography>
         <div className="bg-slate-100 rounded my-2 p-2 border">
            <Typography>{event.description || "Ingen beskrivelse fra arrangør"}</Typography>
            {event.startDate ? (
               <Typography>
                  Start dato:{" "}
                  <span className="font-semibold">
                     {formatDate(event.startDate, "iiii dd.MM.yyyy", { locale: nb })}
                  </span>
               </Typography>
            ) : null}
            {event.startTime ? (
               <Typography>
                  Tidspunkt: <span className="font-semibold">{event.startTime}</span>
               </Typography>
            ) : null}
         </div>

         {isOrganizer ? <EventOrganizers users={users} organizers={organizers} /> : null}
         {organizers.length ? (
            <Typography>Arrangører: {organizers.map((user) => user.primaryUser.name).join(", ")}</Typography>
         ) : null}
         <nav className="border-b-2 mt-4">
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
