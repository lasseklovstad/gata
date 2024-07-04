import type { PushSubscription } from "web-push";

import type { EventSchema } from "~/utils/schemas/eventSchema";

import { getEvent, insertEvent, updateEvent, updateIsUserParticipating } from "../db/gataEvent";
import { getAllSubscriptions, getAllSubscriptionsGoingToEvent } from "../db/pushSubscriptions";
import type { User } from "../db/user";
import { sendPushNotification } from "../services/pushNoticiationService";

export const updateParticipatingAndNotify = async (
   loggedInUser: User,
   eventId: number,
   status: "going" | "notGoing"
) => {
   await updateIsUserParticipating(eventId, loggedInUser.id, status === "going");
   const event = await getEvent(eventId);
   const subscriptions = await getAllSubscriptionsGoingToEvent(eventId, loggedInUser.id);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `${loggedInUser.primaryUser.name} ${status === "going" ? "skal delta på" : "kan ikke delta på"} arrangement ${event.title}`,
         data: { url: "" },
         icon: "/logo192.png",
      }
   );
};

export const updateEventAndNotify = async (
   loggedInUser: User,
   eventId: number,
   { startDate, startTime, description, title }: EventSchema
) => {
   await updateEvent(eventId, { title, description, startTime: startTime ?? null, startDate: startDate ?? null });
   const subscriptions = await getAllSubscriptionsGoingToEvent(eventId, loggedInUser.id);
   const event = await getEvent(eventId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `Arrangement ${event.title} er oppdatert`,
         data: { url: "" },
         icon: "/logo192.png",
      }
   );
};

export const createEventAndNotify = async (
   loggedInUser: User,
   { startDate, startTime, description, title }: EventSchema
) => {
   const eventId = await insertEvent({
      title,
      description,
      startTime: startTime ?? null,
      startDate: startDate ?? null,
      createdBy: loggedInUser.id,
   });

   const subscriptions = await getAllSubscriptions(loggedInUser.id);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `Nytt arrangement ${title} opprettet. Si i fra om du kommer!`,
         data: { url: "" },
         icon: "/logo192.png",
      }
   );

   return eventId;
};

export const notifyParticipantsImagesIsUploaded = async (loggedInUser: User, eventId: number) => {
   const subscriptions = await getAllSubscriptionsGoingToEvent(eventId, loggedInUser.id);
   const event = await getEvent(eventId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `Arrangement ${event.title} er oppdatert med nye bilder`,
         data: { url: "" },
         icon: "/logo192.png",
      }
   );
};
