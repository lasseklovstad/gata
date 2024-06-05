import { relations } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { boolean, integer, pgTable, primaryKey, smallint, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("gata_user", {
   id: uuid("id").primaryKey().defaultRandom(),
   subscribe: boolean("subscribe").default(false).notNull(),
   primaryExternalUserId: varchar("primary_external_user_id", { length: 255 })
      .notNull()
      .unique()
      .references((): AnyPgColumn => externalUser.id),
});

export const externalUser = pgTable("external_user", {
   id: varchar("id", { length: 255 }).primaryKey(),
   name: varchar("name", { length: 255 }).notNull(),
   email: varchar("email", { length: 255 }).notNull(),
   picture: varchar("picture", { length: 500 }),
   lastLogin: text("last_login").notNull(),
   userId: uuid("user_id").references(() => user.id, { onDelete: "set null" }),
});

export type ExternalUser = typeof externalUser.$inferSelect;

export const role = pgTable("gata_role", {
   id: uuid("id").primaryKey().notNull(),
   name: varchar("name", { length: 255 }).notNull(),
   roleName: smallint("role_name").default(0).notNull().unique(),
});

export type Role = typeof role.$inferSelect;

export const userRoles = pgTable("gata_user_roles", {
   usersId: uuid("users_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
   roleId: uuid("roles_id")
      .notNull()
      .references(() => role.id),
});

export const responsibilityNote = pgTable("responsibility_note", {
   id: uuid("id").primaryKey().defaultRandom(),
   lastModifiedBy: varchar("last_modified_by", { length: 255 }).notNull(),
   lastModifiedDate: timestamp("last_modified_date", { mode: "string" }).defaultNow().notNull(),
   text: text("text").notNull().default(""),
   responsibilityYearId: uuid("resonsibility_year_id")
      .references(() => responsibilityYear.id, { onDelete: "cascade" })
      .unique()
      .notNull(),
});

export const responsibility = pgTable("responsibility", {
   id: uuid("id").primaryKey().defaultRandom(),
   description: varchar("description", { length: 255 }).notNull(),
   name: varchar("name", { length: 255 }).notNull(),
});

export const reportFile = pgTable("gata_report_file", {
   id: uuid("id").primaryKey().defaultRandom(),
   data: text("data"),
   reportId: uuid("report_id")
      .references(() => gataReport.id)
      .notNull(),
   cloudUrl: varchar("cloud_url", { length: 255 }),
   cloudId: varchar("cloud_id", { length: 255 }),
});

export const contingent = pgTable(
   "gata_contingent",
   {
      userId: uuid("gata_user_id")
         .references(() => user.id, { onDelete: "cascade" })
         .notNull(),
      isPaid: boolean("is_paid").notNull(),
      year: smallint("year").notNull(),
   },
   (table) => ({ pk: primaryKey({ columns: [table.year, table.userId] }) })
);

export const responsibilityYear = pgTable("responsibility_year", {
   id: uuid("id").primaryKey().defaultRandom(),
   responsibilityId: uuid("responsibility_id")
      .references(() => responsibility.id)
      .notNull(),
   userId: uuid("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
   year: smallint("year").notNull(),
});

export const gataReport = pgTable("gata_report", {
   id: uuid("id").primaryKey().defaultRandom(),
   content: text("content"),
   createdDate: timestamp("created_date", { mode: "string" }).defaultNow().notNull(),
   description: varchar("description", { length: 255 }).default("").notNull(),
   lastModifiedBy: varchar("last_modified_by", { length: 255 }).notNull(),
   lastModifiedDate: timestamp("last_modified_date", { mode: "string" }).defaultNow().notNull(),
   title: varchar("title", { length: 255 }).notNull(),
   type: integer("type").notNull(),
   createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
});

export type GataReport = typeof gataReport.$inferSelect;

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
