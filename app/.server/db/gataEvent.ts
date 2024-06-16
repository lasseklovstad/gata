import { and, count, desc, eq, sql } from "drizzle-orm";

import { db } from "db/config.server";
import {
   cloudinaryImage,
   eventCloudinaryImages,
   eventOrganizer,
   eventPolls,
   gataEvent,
   poll,
   pollOption,
   pollVote,
} from "db/schema";

import type { User } from "./user";

export const insertEvent = async (
   event: { title: string; description: string; createdBy: string },
   datePoll: typeof poll.$inferInsert,
   dateOptions: string[]
) => {
   return await db.transaction(async (tx) => {
      const [{ eventId }] = await tx.insert(gataEvent).values(event).returning({ eventId: gataEvent.id });
      await tx.insert(eventOrganizer).values({ userId: event.createdBy, eventId });
      if (dateOptions.length > 1) {
         const [{ pollId }] = await tx.insert(poll).values(datePoll).returning({ pollId: poll.id });
         await tx.insert(eventPolls).values({ pollId, eventId });
         await tx.insert(pollOption).values(dateOptions.map((textOption) => ({ textOption, pollId })));
      }
      return eventId;
   });
};

export const getUpCommingEvents = async () => {
   return await db.select().from(gataEvent).orderBy(desc(gataEvent.id));
};

export type GataEvent = Awaited<ReturnType<typeof getEvent>>;

export const getEvent = async (eventId: number) => {
   const result = await db.query.gataEvent.findFirst({
      where: eq(gataEvent.id, eventId),
      with: { createdByUser: { with: { primaryUser: true } }, organizers: true },
   });

   if (!result) {
      throw new Error("Could not find event");
   }
   return result;
};

export const deleteEvent = async (eventId: number) => {
   await db.delete(gataEvent).where(eq(gataEvent.id, eventId));
};

export const updateEvent = async (eventId: number, values: Partial<typeof gataEvent.$inferInsert>) => {
   await db.update(gataEvent).set(values).where(eq(gataEvent.id, eventId));
};

export const getEventPollsSimple = async (eventId: number) => {
   return await db.query.eventPolls.findMany({
      where: eq(eventPolls.eventId, eventId),
      with: { poll: { columns: { id: true, name: true, isActive: true } } },
      orderBy: desc(eventPolls.pollId),
   });
};

export type Poll = Awaited<ReturnType<typeof getEventPolls>>[number];

export const getEventPolls = async (eventId: number, loggedInUser: User) => {
   return (
      await db.query.eventPolls.findMany({
         where: eq(eventPolls.eventId, eventId),
         with: {
            poll: {
               with: {
                  pollOptions: true,
                  pollVotes: true,
               },
            },
         },
         orderBy: desc(eventPolls.pollId),
      })
   ).map((eventPoll) => ({
      ...eventPoll,
      poll: {
         ...eventPoll.poll,
         pollVotes: eventPoll.poll.pollVotes.map((pollVote) => ({
            ...pollVote,
            // Don't expose userId for vote if poll is Anonymous
            userId: eventPoll.poll.isAnonymous && loggedInUser.id !== pollVote.userId ? "" : pollVote.userId,
         })),
         numberOfVotes: [...new Set(eventPoll.poll.pollVotes.map((pollVote) => pollVote.userId))].length,
      },
   }));
};

export const getIsPollActive = async (pollId: number) => {
   const result = await db.query.poll.findFirst({ where: eq(poll.id, pollId), columns: { isActive: true } });
   return !!result?.isActive;
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
      await tx.delete(pollVote).where(and(eq(pollVote.userId, userId), eq(pollVote.pollId, pollId)));
      if (!options.length) return;
      await tx.insert(pollVote).values(options.map((pollOptionId) => ({ pollId, pollOptionId, userId })));
   });
};

export const updatePoll = async (pollId: number, values: Partial<typeof poll.$inferInsert>) => {
   await db.update(poll).set(values).where(eq(poll.id, pollId));
};

export const deletePoll = async (pollId: number) => {
   await db.delete(poll).where(eq(poll.id, pollId));
};

export const insertNewTextPoll = async (eventId: number, datePoll: typeof poll.$inferInsert, textOptions: string[]) => {
   await db.transaction(async (tx) => {
      const [{ pollId }] = await tx.insert(poll).values(datePoll).returning({ pollId: poll.id });
      await tx.insert(eventPolls).values({ pollId, eventId });
      await tx.insert(pollOption).values(textOptions.map((textOption) => ({ textOption, pollId })));
   });
};

export const updateOrganizers = async (eventId: number, organizers: string[]) => {
   await db.transaction(async (tx) => {
      await tx.delete(eventOrganizer).where(eq(eventOrganizer.eventId, eventId));
      await tx.insert(eventOrganizer).values(organizers.map((userId) => ({ userId, eventId })));
   });
};

export const insertCloudinaryImage = async (eventId: number, values: typeof cloudinaryImage.$inferInsert) => {
   return await db.transaction(async (tx) => {
      await tx.insert(cloudinaryImage).values(values);
      await tx.insert(eventCloudinaryImages).values({ eventId, cloudId: values.cloudId });
   });
};

export const getEventCloudinaryImages = async (eventId: number) => {
   return await db
      .select({
         cloudId: cloudinaryImage.cloudId,
         cloudUrl: cloudinaryImage.cloudUrl,
         width: cloudinaryImage.width,
         height: cloudinaryImage.height,
      })
      .from(eventCloudinaryImages)
      .innerJoin(cloudinaryImage, eq(cloudinaryImage.cloudId, eventCloudinaryImages.cloudId))
      .orderBy(desc(sql`${eventCloudinaryImages}.rowid`))
      .where(eq(eventCloudinaryImages.eventId, eventId));
};

export const deleteEventCloudinaryImage = async (cloudId: string) => {
   await db.delete(cloudinaryImage).where(eq(cloudinaryImage.cloudId, cloudId));
};

export const getNumberOfImages = async (eventId: number) => {
   return (
      await db.select({ count: count() }).from(eventCloudinaryImages).where(eq(eventCloudinaryImages.eventId, eventId))
   )[0].count;
};
