import { desc, eq, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { eventPolls, gataEvent, poll, pollOption, pollVote } from "db/schema";

export const insertEvent = async (
   event: typeof gataEvent.$inferInsert,
   datePoll: typeof poll.$inferInsert,
   dateOptions: Date[]
) => {
   return await db.transaction(async (tx) => {
      const [{ eventId }] = await tx.insert(gataEvent).values(event).returning({ eventId: gataEvent.id });
      const [{ pollId }] = await tx.insert(poll).values(datePoll).returning({ pollId: poll.id });
      await tx.insert(eventPolls).values({ pollId, eventId });
      await tx.insert(pollOption).values(dateOptions.map((dateOption) => ({ dateOption, pollId })));
      return eventId;
   });
};

export const getEvent = async (eventId: number) => {
   const result = await db.query.gataEvent.findFirst({
      where: eq(gataEvent.id, eventId),
      with: { createdByUser: { with: { primaryUser: true } } },
   });

   if (!result) {
      throw new Error("Could not find event");
   }
   return result;
};

export type Poll = Awaited<ReturnType<typeof getEventPolls>>[number];

export const getEventPolls = async (eventId: number) => {
   return await db.query.eventPolls.findMany({
      where: eq(eventPolls.eventId, eventId),
      with: { poll: { with: { pollOptions: true, pollVotes: true } } },
      orderBy: desc(eventPolls.pollId),
   });
};

type InsertPollDateVote = {
   userId: string;
   pollId: number;
   options: number[];
};

export const insertDatePollVote = async ({ userId, pollId, options }: InsertPollDateVote) => {
   if (!options.length) return;
   await db.insert(pollVote).values(options.map((pollOptionId) => ({ pollId, pollOptionId, userId })));
};

export const updateDatePollVote = async ({ userId, pollId, options }: InsertPollDateVote) => {
   await db.transaction(async (tx) => {
      await tx.delete(pollVote).where(eq(pollVote.userId, userId));
      if (!options.length) return;
      await tx.insert(pollVote).values(options.map((pollOptionId) => ({ pollId, pollOptionId, userId })));
   });
};

export const toggleActive = async (pollId: number) => {
   await db
      .update(poll)
      .set({ isActive: sql`not ${poll.isActive}` })
      .where(eq(poll.id, pollId));
};

export const deletePoll = async (pollId: number) => {
   await db.delete(poll).where(eq(poll.id, pollId));
};

export const insertNewDatePoll = async (eventId: number, datePoll: typeof poll.$inferInsert, dateOptions: Date[]) => {
   await db.transaction(async (tx) => {
      const [{ pollId }] = await tx.insert(poll).values(datePoll).returning({ pollId: poll.id });
      await tx.insert(eventPolls).values({ pollId, eventId });
      await tx.insert(pollOption).values(dateOptions.map((dateOption) => ({ dateOption, pollId })));
   });
};

export const insertNewTextPoll = async (eventId: number, datePoll: typeof poll.$inferInsert, textOptions: string[]) => {
   await db.transaction(async (tx) => {
      const [{ pollId }] = await tx.insert(poll).values(datePoll).returning({ pollId: poll.id });
      await tx.insert(eventPolls).values({ pollId, eventId });
      await tx.insert(pollOption).values(textOptions.map((textOption) => ({ textOption, pollId })));
   });
};
