import { db } from "db/config.server";
import { userTimelineEvent } from "db/schema";

export const insertUserTimelineEvent = async (event: typeof userTimelineEvent.$inferInsert): Promise<string> => {
   const [{ eventId }] = await db.insert(userTimelineEvent).values(event).returning({ eventId: userTimelineEvent.id });
   return eventId;
};

export const getAllUserTimelineEvents = async () => {
   return await db.select().from(userTimelineEvent);
};
