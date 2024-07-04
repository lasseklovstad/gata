import type { PushSubscription } from "web-push";

import type { NewPollSchema, PollVoteSchema, UpdatePollSchema } from "~/utils/schemas/eventPollSchema";

import { getEvent, getPoll, insertNewPoll, insertPollVote, updatePoll } from "../db/gataEvent";
import { getAllSubscriptionEventOrganizers, getAllSubscriptionsGoingToEvent } from "../db/pushSubscriptions";
import type { User } from "../db/user";
import { sendPushNotification } from "../services/pushNoticiationService";

export const createNewPoll = async (
   loggedInUser: User,
   eventId: number,
   { dateOption, textOption, ...poll }: NewPollSchema
) => {
   await insertNewPoll(eventId, poll, poll.type === "text" ? textOption : dateOption);
   const subscriptions = await getAllSubscriptionsGoingToEvent(eventId, loggedInUser.id);
   const event = await getEvent(eventId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `📝 Ny avstemning ${poll.name} i arrangement ${event.title}`,
         data: { url: "" },
         icon: "/logo192.png",
      }
   );
};

export const updatePollAndNotify = async (
   loggedInUser: User,
   eventId: number,
   { pollId, isFinished, ...pollValues }: UpdatePollSchema
) => {
   await updatePoll(pollId, { ...pollValues, isActive: !isFinished });
   const subscriptions = await getAllSubscriptionsGoingToEvent(eventId, loggedInUser.id);
   const event = await getEvent(eventId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `📝 Avstemning ${pollValues.name} er endret i arrangement ${event.title}`,
         data: { url: "" },
         icon: "/logo192.png",
      }
   );
};

export const addPollVoteAndNotify = async (loggedInUser: User, eventId: number, form: PollVoteSchema) => {
   await insertPollVote(form);
   const subscriptions = await getAllSubscriptionEventOrganizers(eventId, loggedInUser.id);
   const event = await getEvent(eventId);
   const [poll] = await getPoll(form.pollId);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `📝 Ny avstemning registrert ${poll.name} er endret i arrangement ${event.title}`,
         data: { url: "" },
         icon: "/logo192.png",
      }
   );
};
