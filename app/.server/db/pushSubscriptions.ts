import { eq } from "drizzle-orm";

import { db } from "db/config.server";
import { pushSubscriptions } from "db/schema";

export const insertPushSubscription = async (userId: string, endpoint: string, subscription: PushSubscriptionJSON) => {
   await db.insert(pushSubscriptions).values({ userId, subscription, endpoint });
};

export const deletePushSubscription = async (endpoint: string) => {
   await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
};

export const getSubscriptions = async () => {
   return await db.select().from(pushSubscriptions);
};
