import { and, eq, ne } from "drizzle-orm";

import { db } from "db/config.server";
import { eventOrganizer, eventParticipants, pushSubscriptions } from "db/schema";

export const insertPushSubscription = async (userId: string, endpoint: string, subscription: PushSubscriptionJSON) => {
   await db.insert(pushSubscriptions).values({ userId, subscription, endpoint });
};

export const deletePushSubscription = async (endpoint: string) => {
   await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
};

export const getAllSubscriptions = async (notIncludedUser: string) => {
   return await db.select().from(pushSubscriptions).where(ne(pushSubscriptions.userId, notIncludedUser));
};

export const getAllSubscriptionsGoingToEvent = async (eventId: number, notIncludedUser: string) => {
   return await db
      .select({ subscription: pushSubscriptions.subscription })
      .from(pushSubscriptions)
      .innerJoin(eventParticipants, eq(eventParticipants.userId, pushSubscriptions.userId))
      .where(
         and(
            eq(eventParticipants.eventId, eventId),
            eq(eventParticipants.isParticipating, true),
            ne(pushSubscriptions.userId, notIncludedUser)
         )
      );
};

export const getAllSubscriptionEventOrganizers = async (eventId: number, notIncludedUser: string) => {
   return await db
      .select({ subscription: pushSubscriptions.subscription })
      .from(pushSubscriptions)
      .innerJoin(eventOrganizer, eq(eventOrganizer.userId, pushSubscriptions.userId))
      .where(and(eq(eventOrganizer.eventId, eventId), ne(pushSubscriptions.userId, notIncludedUser)));
};
