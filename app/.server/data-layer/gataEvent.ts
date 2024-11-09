import type { PushSubscription } from "web-push";

import type { EventSchema } from "~/utils/schemas/eventSchema";

import { getEvent, insertEvent, updateEvent, updateIsUserParticipating } from "../db/gataEvent";
import {
   getAllSubscriptions,
   getAllSubscriptionsGoingToEvent,
   getAllSubscriptionsInvolvedInMessage,
   getSubscriptionForMessage,
} from "../db/pushSubscriptions";
import type { User } from "../db/user";
import { sendPushNotification } from "../services/pushNoticiationService";

export const updateParticipatingAndNotify = async (
   loggedInUser: User,
   eventId: number,
   status: "going" | "notGoing" | undefined,
   unsubscribed: boolean
) => {
   await updateIsUserParticipating(eventId, loggedInUser.id, status ? status === "going" : null, unsubscribed);
   const event = await getEvent(eventId);
   const subscriptions = await getAllSubscriptionsGoingToEvent(eventId, loggedInUser.id);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `${status === "going" ? "✔️" : "❌"} ${loggedInUser.name} ${status === "going" ? "skal delta på" : "kan ikke delta på"} arrangement ${event.title}`,
         data: { url: `/event/${eventId}` },
         icon: "/logo192.png",
      }
   );
};

export const updateEventAndNotify = async (
   loggedInUser: User,
   eventId: number,
   { startDate, startTime, description, title, visibility }: EventSchema,
   shouldNotifyNewEvent: boolean
) => {
   await updateEvent(eventId, {
      title,
      description,
      startTime: startTime ?? null,
      startDate: startDate ?? null,
      visibility,
   });

   const event = await getEvent(eventId);

   if (shouldNotifyNewEvent) {
      await notifyNewEvent(loggedInUser, event.title, event.id);
   } else {
      const subscriptions = await getAllSubscriptionsGoingToEvent(eventId, loggedInUser.id);
      await sendPushNotification(
         subscriptions.map((s) => s.subscription as PushSubscription),
         {
            body: `📅 Arrangement ${event.title} er oppdatert`,
            data: { url: `/event/${eventId}` },
            icon: "/logo192.png",
         }
      );
   }
};

const notifyNewEvent = async (loggedInUser: User, title: string, eventId: number) => {
   const subscriptions = await getAllSubscriptions(loggedInUser.id);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `📅 Nytt arrangement ${title} opprettet. Si i fra om du kommer 🎉`,
         data: { url: `/event/${eventId}` },
         icon: "/logo192.png",
      }
   );
};

export const createEventAndNotify = async (
   loggedInUser: User,
   { startDate, startTime, description, title, visibility }: EventSchema
) => {
   const eventId = await insertEvent({
      title,
      description,
      startTime: startTime ?? null,
      startDate: startDate ?? null,
      createdBy: loggedInUser.id,
      visibility,
   });

   if (visibility === "everyone") {
      await notifyNewEvent(loggedInUser, title, eventId);
   }

   return eventId;
};

export const notifyParticipantsImagesIsUploaded = async (loggedInUser: User, eventId: number) => {
   const subscriptions = await getAllSubscriptionsGoingToEvent(eventId, loggedInUser.id);
   const event = await getEvent(eventId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `Arrangement ${event.title} er oppdatert med nye bilder 📷`,
         data: { url: `/event/${eventId}` },
         icon: "/logo192.png",
      }
   );
};

export const notifyParticipantsNewPostCreated = async (
   userThatCreatedPost: User,
   eventId: number,
   messageId: number
) => {
   const subscriptions = await getAllSubscriptionsGoingToEvent(eventId, userThatCreatedPost.id);
   const event = await getEvent(eventId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `${userThatCreatedPost.name} publiserte et nytt innlegg`,
         data: { url: `/event/${eventId}?messageId=${messageId}` },
         icon: "/logo192.png",
         title: event.title,
      }
   );
};

export const notifyParticipantsReplyToPost = async (
   loggedInUser: User,
   eventId: number,
   messageId: number,
   replyId: number
) => {
   const subscriptions = await getAllSubscriptionsInvolvedInMessage(messageId, loggedInUser.id);
   const event = await getEvent(eventId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `${loggedInUser.name} kommenterte på et innlegg`,
         data: { url: `/event/${eventId}?messageId=${replyId}` },
         icon: "/logo192.png",
         title: event.title,
      }
   );
};

export const notifyParticipantLikeOnPost = async (loggedInUser: User, eventId: number, messageId: number) => {
   const subscriptions = await getSubscriptionForMessage(messageId, loggedInUser.id);
   const event = await getEvent(eventId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `${loggedInUser.name} reagerte på ditt innlegg`,
         data: { url: `/event/${eventId}?messageId=${messageId}` },
         icon: "/logo192.png",
         title: event.title,
      }
   );
};
