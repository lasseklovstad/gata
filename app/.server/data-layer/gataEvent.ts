import type { PushSubscription } from "web-push";

import type { EventSchema } from "~/utils/schemas/eventSchema";

import { getEvent, getEventParticipant, insertEvent, updateEvent, updateIsUserParticipating } from "../db/gataEvent";
import {
   getAllSubscriptions,
   getAllSubscriptionsNotUnsubscribedEvent,
   getAllSubscriptionsInvolvedInMessage,
   getSubscriptionForMessage,
   getAllSubscriptionsForEvent,
} from "../db/pushSubscriptions";
import type { User } from "../db/user";
import { sendPushNotification } from "../services/pushNoticiationService";

export const updateParticipatingAndNotify = async (
   loggedInUser: User,
   eventId: number,
   status: "going" | "notGoing" | undefined,
   unsubscribed: boolean
) => {
   const oldEventParticipant = await getEventParticipant(eventId, loggedInUser.id);
   const isParticipating = status ? status === "going" : null;
   await updateIsUserParticipating(eventId, loggedInUser.id, isParticipating, unsubscribed);

   if (isParticipating !== null && oldEventParticipant?.isParticipating !== isParticipating) {
      const event = await getEvent(eventId);
      const subscriptions = await getAllSubscriptionsNotUnsubscribedEvent(eventId, loggedInUser.id);

      await sendPushNotification(
         subscriptions.map((s) => s.subscription as PushSubscription),
         {
            body: `${status === "going" ? "✔️" : "❌"} ${loggedInUser.name} ${status === "going" ? "skal delta på" : "kan ikke delta på"} arrangement ${event.title}`,
            data: { url: `/event/${eventId}` },
            icon: "/logo192.png",
         }
      );
   }
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
      const subscriptions = await getAllSubscriptionsNotUnsubscribedEvent(eventId, loggedInUser.id);
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
   const subscriptions = await getAllSubscriptionsNotUnsubscribedEvent(eventId, loggedInUser.id);
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
   messageId: number,
   message: string
) => {
   const subscriptions = await getAllSubscriptionsForEvent(eventId, userThatCreatedPost.id);
   const event = await getEvent(eventId);
   await Promise.all(
      subscriptions.map((s) => {
         const subscribed = s.unsubscribed === false || s.unsubscribed === null;
         const isTagged = message.includes(`@${s.name}`);
         if (subscribed || isTagged) {
            // Send push if user is tagged or subscribed
            return sendPushNotification([s.subscription as PushSubscription], {
               body: isTagged
                  ? `${userThatCreatedPost.name} tagget deg i et nytt innlegg`
                  : `${userThatCreatedPost.name} publiserte et nytt innlegg`,
               data: { url: `/event/${eventId}?messageId=${messageId}` },
               icon: "/logo192.png",
               title: event.title,
            });
         }
         return Promise.resolve();
      })
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

const likeMapping = {
   thumbsUp: "👍",
   thumbsDown: "👎",
   heart: "❤️",
   party: "🎉",
   cry: "😢",
   angry: "😠",
   haha: "😂",
};

export const notifyParticipantLikeOnPost = async (
   loggedInUser: User,
   eventId: number,
   messageId: number,
   type: keyof typeof likeMapping
) => {
   const subscriptions = await getSubscriptionForMessage(messageId, loggedInUser.id);
   const event = await getEvent(eventId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `${loggedInUser.name} reagerte ${likeMapping[type]} på ditt innlegg`,
         data: { url: `/event/${eventId}?messageId=${messageId}` },
         icon: "/logo192.png",
         title: event.title,
      }
   );
};
