import { and, eq, exists, getTableColumns, isNull, ne, or } from "drizzle-orm";
import { union } from "drizzle-orm/sqlite-core";

import { db } from "db/config.server";
import { eventOrganizer, eventParticipants, messageReplies, messages, pushSubscriptions, user } from "db/schema";

export const insertPushSubscription = async (userId: string, endpoint: string, subscription: PushSubscriptionJSON) => {
   await db.insert(pushSubscriptions).values({ userId, subscription, endpoint });
};

export const deletePushSubscription = async (endpoint: string) => {
   await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
};

export const getAllSubscriptions = async (notIncludedUser: string) => {
   return await db.select().from(pushSubscriptions).where(ne(pushSubscriptions.userId, notIncludedUser));
};

export const getAllUsersWithSubscription = async (notIncludedUser: string) => {
   return await db
      .select()
      .from(user)
      .where(
         and(
            ne(user.id, notIncludedUser),
            exists(
               db
                  .select({ id: pushSubscriptions.userId })
                  .from(pushSubscriptions)
                  .where(eq(pushSubscriptions.userId, user.id))
            )
         )
      );
};

export const getAllSubscriptionsForEvent = async (eventId: number, notIncludedUser: string) => {
   return await db
      .select({ ...getTableColumns(pushSubscriptions), name: user.name, unsubscribed: eventParticipants.unsubscribed })
      .from(pushSubscriptions)
      .leftJoin(
         eventParticipants,
         and(eq(eventParticipants.userId, pushSubscriptions.userId), eq(eventParticipants.eventId, eventId))
      )
      .innerJoin(user, eq(user.id, pushSubscriptions.userId))
      .where(ne(pushSubscriptions.userId, notIncludedUser));
};

export const getAllSubscriptionsNotUnsubscribedEvent = async (eventId: number, notIncludedUser: string) => {
   return await db
      .select({ ...getTableColumns(pushSubscriptions), name: user.name })
      .from(pushSubscriptions)
      .leftJoin(
         eventParticipants,
         and(eq(eventParticipants.userId, pushSubscriptions.userId), eq(eventParticipants.eventId, eventId))
      )
      .innerJoin(user, eq(user.id, pushSubscriptions.userId))
      .where(
         and(
            ne(pushSubscriptions.userId, notIncludedUser),
            or(isNull(eventParticipants.unsubscribed), eq(eventParticipants.unsubscribed, false))
         )
      );
};

export const getAllSubscriptionsInvolvedInMessage = async (messageId: number, notIncludedUser: string) => {
   return await union(
      // Users from message
      db
         .select(getTableColumns(pushSubscriptions))
         .from(messages)
         .innerJoin(pushSubscriptions, eq(messages.userId, pushSubscriptions.userId))
         .where(and(eq(messages.id, messageId), ne(pushSubscriptions.userId, notIncludedUser))),
      // Users from replies
      db
         .select(getTableColumns(pushSubscriptions))
         .from(messageReplies)
         .innerJoin(messages, eq(messages.id, messageReplies.replyId))
         .innerJoin(pushSubscriptions, eq(messages.userId, pushSubscriptions.userId))
         .where(and(eq(messageReplies.messageId, messageId), ne(pushSubscriptions.userId, notIncludedUser)))
   );
};

export const getSubscriptionForMessage = async (messageId: number, notIncludedUser: string) => {
   return await db
      .select({ subscription: pushSubscriptions.subscription })
      .from(messages)
      .innerJoin(pushSubscriptions, eq(messages.userId, pushSubscriptions.userId))
      .where(and(eq(messages.id, messageId), ne(pushSubscriptions.userId, notIncludedUser)));
};

export const getAllSubscriptionEventOrganizers = async (eventId: number, notIncludedUser: string) => {
   return await db
      .select({ subscription: pushSubscriptions.subscription })
      .from(pushSubscriptions)
      .innerJoin(eventOrganizer, eq(eventOrganizer.userId, pushSubscriptions.userId))
      .where(and(eq(eventOrganizer.eventId, eventId), ne(pushSubscriptions.userId, notIncludedUser)));
};
