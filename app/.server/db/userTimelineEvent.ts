import { eq } from "drizzle-orm";

import { db } from "db/config.server";
import { userTimelineEvent } from "db/schema";

export const insertUserTimelineEvent = async (event: typeof userTimelineEvent.$inferInsert): Promise<string> => {
   const [{ eventId }] = await db.insert(userTimelineEvent).values(event).returning({ eventId: userTimelineEvent.id });
   return eventId;
};

export type TimeLineEvent = Awaited<ReturnType<typeof getAllUserTimelineEvents>>[number];

export const getAllUserTimelineEvents = async () => {
   return await db.select().from(userTimelineEvent);
};

export const updateUserTimelineEvent = async (
   eventId: string,
   values: Partial<typeof userTimelineEvent.$inferInsert>
) => {
   await db.update(userTimelineEvent).set(values).where(eq(userTimelineEvent.id, eventId));
};
