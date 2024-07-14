import { relations, sql } from "drizzle-orm";
import { blob, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { env } from "~/utils/env.server";

export const user = sqliteTable("gata_user", {
   id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
   subscribe: integer("subscribe", { mode: "boolean" }).default(false).notNull(),
   primaryExternalUserId: text("primary_external_user_id").notNull().unique(),
   name: text("name").notNull(),
   picture: text("picture").notNull(),
   //.references((): AnySQLiteColumn => externalUser.id),
});

export const externalUser = sqliteTable("external_user", {
   id: text("id").primaryKey(),
   name: text("name").notNull(),
   email: text("email").notNull(),
   picture: text("picture"),
   lastLogin: text("last_login").notNull(),
   userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
});

export type ExternalUser = typeof externalUser.$inferSelect;

export const role = sqliteTable("gata_role", {
   id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
   name: text("name").notNull(),
   roleName: integer("role_name").default(0).notNull().unique(),
});

export type Role = typeof role.$inferSelect;

export const userRoles = sqliteTable("gata_user_roles", {
   usersId: text("users_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
   roleId: text("roles_id")
      .notNull()
      .references(() => role.id),
});

export const pushSubscriptions = sqliteTable("push_subscriptions", {
   userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
   endpoint: text("endpoint").primaryKey(),
   subscription: blob("subscription", { mode: "json" }).notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;

export const responsibilityNote = sqliteTable("responsibility_note", {
   id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
   lastModifiedBy: text("last_modified_by").notNull(),
   lastModifiedDate: text("last_modified_date")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
   text: text("text").notNull().default(""),
   responsibilityYearId: text("resonsibility_year_id")
      .references(() => responsibilityYear.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
});

export const responsibility = sqliteTable("responsibility", {
   id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
   description: text("description").notNull(),
   name: text("name", { length: 255 }).notNull(),
});

export const reportFile = sqliteTable("gata_report_file", {
   id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
   data: text("data"),
   reportId: text("report_id")
      .references(() => gataReport.id)
      .notNull(),
   cloudUrl: text("cloud_url"),
   cloudId: text("cloud_id"),
});

export const contingent = sqliteTable(
   "gata_contingent",
   {
      userId: text("gata_user_id")
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      isPaid: integer("is_paid", { mode: "boolean" }).notNull(),
      year: integer("year").notNull(),
      amount: integer("amount")
         .notNull()
         .default(600)
         .$defaultFn(() => Number(env.DEFAULT_CONTINGENT_SIZE)),
   },
   (table) => ({ pk: primaryKey({ columns: [table.year, table.userId] }) })
);

export const responsibilityYear = sqliteTable("responsibility_year", {
   id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
   responsibilityId: text("responsibility_id")
      .references(() => responsibility.id)
      .notNull(),
   userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
   year: integer("year").notNull(),
});

export const gataReport = sqliteTable("gata_report", {
   id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
   content: text("content"),
   createdDate: text("created_date")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
   description: text("description").default("").notNull(),
   lastModifiedBy: text("last_modified_by").notNull(),
   lastModifiedDate: text("last_modified_date")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
   title: text("title").notNull(),
   type: integer("type").notNull(),
   createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
});

export type GataReport = typeof gataReport.$inferSelect;

export const gataEvent = sqliteTable("gata_event", {
   id: integer("id").primaryKey(),
   title: text("title").notNull(),
   description: text("description").notNull(),
   startDate: text("start_date"), // yyyy-MM-dd
   startTime: text("start_time"), // kk.mm
   createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
});

export const eventOrganizer = sqliteTable(
   "event_organizer",
   {
      eventId: integer("event_id")
         .notNull()
         .references(() => gataEvent.id, { onDelete: "cascade" }),
      userId: text("user_id")
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
   },
   (table) => ({ pk: primaryKey({ columns: [table.eventId, table.userId] }) })
);

export const eventPolls = sqliteTable("event_polls", {
   eventId: integer("event_id")
      .references(() => gataEvent.id, { onDelete: "cascade" })
      .notNull(),
   pollId: integer("poll_id")
      .references(() => poll.id, { onDelete: "cascade" })
      .notNull(),
});

export const poll = sqliteTable("poll", {
   id: integer("id").primaryKey(),
   name: text("name").notNull(),
   type: text("type", { enum: ["date", "text"] }).notNull(),
   canSelectMultiple: integer("can_select_multiple", { mode: "boolean" }).notNull(),
   canAddSuggestions: integer("can_add_suggestions", { mode: "boolean" }).notNull(),
   isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull(),
   isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
});

export const pollOption = sqliteTable("poll_option", {
   id: integer("id").primaryKey(),
   textOption: text("text_option").notNull(),
   pollId: integer("poll_id")
      .notNull()
      .references(() => poll.id, { onDelete: "cascade" }),
});

export const cloudinaryImage = sqliteTable("cloudinary_image", {
   cloudUrl: text("cloud_url").notNull(),
   cloudId: text("cloud_id").primaryKey(),
   width: integer("width").notNull(),
   height: integer("height").notNull(),
});

export type CloudinaryImage = typeof cloudinaryImage.$inferSelect;

export const eventCloudinaryImages = sqliteTable("event_cloudinary_images", {
   // Ikke slett bilde hvis event slettes
   eventId: integer("event_id")
      .references(() => gataEvent.id)
      .notNull(),
   cloudId: text("cloudinary_cloud_id")
      .references(() => cloudinaryImage.cloudId, { onDelete: "cascade" })
      .notNull(),
});

export const pollVote = sqliteTable(
   "poll_vote",
   {
      pollId: integer("poll_id")
         .notNull()
         .references(() => poll.id, { onDelete: "cascade" }),
      pollOptionId: integer("poll_option_id")
         .notNull()
         .references(() => pollOption.id, { onDelete: "cascade" }),
      userId: text("user_id")
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
   },
   (table) => ({ pk: primaryKey({ columns: [table.pollId, table.pollOptionId, table.userId] }) })
);

export const eventParticipants = sqliteTable(
   "event_participants",
   {
      eventId: integer("event_id")
         .notNull()
         .references(() => gataEvent.id, { onDelete: "cascade" }),
      userId: text("user_id")
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      isParticipating: integer("is_participating", { mode: "boolean" }).notNull(),
   },
   (table) => ({ pk: primaryKey({ columns: [table.eventId, table.userId] }) })
);

export const eventMessages = sqliteTable(
   "event_messages",
   {
      eventId: integer("event_id")
         .notNull()
         .references(() => gataEvent.id, { onDelete: "cascade" }),
      messageId: integer("message_id")
         .notNull()
         .references(() => messages.id, { onDelete: "cascade" }),
   },
   (table) => ({ pk: primaryKey({ columns: [table.eventId, table.messageId] }) })
);

export const eventMessagesRelations = relations(eventMessages, ({ one }) => ({
   event: one(gataEvent, {
      fields: [eventMessages.eventId],
      references: [gataEvent.id],
   }),
   message: one(messages, {
      fields: [eventMessages.messageId],
      references: [messages.id],
   }),
}));

export const messages = sqliteTable("messages", {
   id: integer("id").primaryKey(),
   userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
   message: text("message").notNull(),
   dateTime: text("date_time")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
});

export const messagesRelations = relations(messages, ({ one, many }) => ({
   likes: many(messageLikes),
   replies: many(messageReplies, { relationName: "message" }),
   user: one(user, {
      fields: [messages.userId],
      references: [user.id],
   }),
}));

export const messageLikes = sqliteTable(
   "message_likes",
   {
      messageId: integer("message_id")
         .notNull()
         .references(() => messages.id, { onDelete: "cascade" }),
      userId: text("user_id")
         .notNull()
         .references(() => user.id, { onDelete: "cascade" }),
      type: text("type").notNull(),
   },
   (table) => ({ pk: primaryKey({ columns: [table.messageId, table.userId] }) })
);

export const messageLikesRelations = relations(messageLikes, ({ one }) => ({
   message: one(messages, {
      fields: [messageLikes.messageId],
      references: [messages.id],
   }),
   user: one(user, {
      fields: [messageLikes.userId],
      references: [user.id],
   }),
}));

export const messageReplies = sqliteTable(
   "message_replies",
   {
      messageId: integer("message_id")
         .notNull()
         .references(() => messages.id, { onDelete: "cascade" }),
      replyId: integer("reply_id")
         .notNull()
         .references(() => messages.id, { onDelete: "cascade" }),
   },
   (table) => ({ pk: primaryKey({ columns: [table.messageId, table.replyId] }) })
);

export const messageRepliesRelations = relations(messageReplies, ({ one }) => ({
   message: one(messages, {
      fields: [messageReplies.messageId],
      references: [messages.id],
      relationName: "message",
   }),
   reply: one(messages, {
      fields: [messageReplies.replyId],
      references: [messages.id],
      relationName: "reply",
   }),
}));

// Relations

export const externalUserRelations = relations(externalUser, ({ one }) => ({
   user: one(user, {
      fields: [externalUser.userId],
      references: [user.id],
   }),
}));

export const gata_userRelations = relations(user, ({ many, one }) => ({
   externalUsers: many(externalUser),
   roles: many(userRoles),
   contingents: many(contingent),
   responsibilityYears: many(responsibilityYear),
   gataReports: many(gataReport),
   primaryUser: one(externalUser, {
      fields: [user.primaryExternalUserId],
      references: [externalUser.id],
   }),
}));

export const gata_user_rolesRelations = relations(userRoles, ({ one }) => ({
   user: one(user, {
      fields: [userRoles.usersId],
      references: [user.id],
   }),
   role: one(role, {
      fields: [userRoles.roleId],
      references: [role.id],
   }),
}));

export const roleRelations = relations(role, ({ many }) => ({
   userRoles: many(userRoles),
}));

export const responsibility_noteRelations = relations(responsibilityNote, ({ one }) => ({
   responsibilityYear: one(responsibilityYear, {
      fields: [responsibilityNote.responsibilityYearId],
      references: [responsibilityYear.id],
   }),
}));

export const responsibility_yearRelations = relations(responsibilityYear, ({ one }) => ({
   note: one(responsibilityNote),
   user: one(user, {
      fields: [responsibilityYear.userId],
      references: [user.id],
   }),
   responsibility: one(responsibility, {
      fields: [responsibilityYear.responsibilityId],
      references: [responsibility.id],
   }),
}));

export const gataReportFileRelations = relations(reportFile, ({ one }) => ({
   gataReport: one(gataReport, {
      fields: [reportFile.reportId],
      references: [gataReport.id],
   }),
}));

export const gataReportRelations = relations(gataReport, ({ one, many }) => ({
   gataReportFiles: many(reportFile),
   user: one(user, {
      fields: [gataReport.createdBy],
      references: [user.id],
   }),
}));

export const contingentRelations = relations(contingent, ({ one }) => ({
   user: one(user, {
      fields: [contingent.userId],
      references: [user.id],
   }),
}));

export const responsibilityRelations = relations(responsibility, ({ many }) => ({
   responsibilityYears: many(responsibilityYear),
}));

export const gataEventRelations = relations(gataEvent, ({ one, many }) => ({
   createdByUser: one(user, { fields: [gataEvent.createdBy], references: [user.id] }),
   polls: many(eventPolls),
   organizers: many(eventOrganizer),
   messages: many(eventMessages),
}));

export const eventPollsRelations = relations(eventPolls, ({ one }) => ({
   event: one(gataEvent, { fields: [eventPolls.eventId], references: [gataEvent.id] }),
   poll: one(poll, { fields: [eventPolls.pollId], references: [poll.id] }),
}));

export const pollRelations = relations(poll, ({ many }) => ({
   pollOptions: many(pollOption),
   pollVotes: many(pollVote),
}));

export const pollOptionRelations = relations(pollOption, ({ one }) => ({
   poll: one(poll, { fields: [pollOption.pollId], references: [poll.id] }),
}));

export const pollVoteRelations = relations(pollVote, ({ one }) => ({
   poll: one(poll, { fields: [pollVote.pollId], references: [poll.id] }),
}));

export const eventOrganizersRelations = relations(eventOrganizer, ({ one }) => ({
   event: one(gataEvent, { fields: [eventOrganizer.eventId], references: [gataEvent.id] }),
   user: one(user, { fields: [eventOrganizer.userId], references: [user.id] }),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
   event: one(gataEvent, { fields: [eventParticipants.eventId], references: [gataEvent.id] }),
   user: one(user, { fields: [eventParticipants.userId], references: [user.id] }),
}));
