import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, smallint, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

export const externalUser = pgTable("external_user", {
   id: varchar("id", { length: 255 }).primaryKey().notNull(),
   name: varchar("name", { length: 255 }),
   email: varchar("email", { length: 255 }),
   picture: varchar("picture", { length: 500 }),
   lastLogin: varchar("last_login", { length: 255 }),
   userId: uuid("user_id").references(() => user.id),
   primaryUser: boolean("primary_user").notNull(),
});

export type ExternalUser = typeof externalUser.$inferSelect;

export const role = pgTable("gata_role", {
   id: uuid("id").primaryKey().notNull(),
   name: varchar("name", { length: 255 }).notNull(),
   roleName: smallint("role_name").default(0).notNull(),
});

export type Role = typeof role.$inferSelect;

export const userRoles = pgTable("gata_user_roles", {
   usersId: uuid("users_id")
      .notNull()
      .references(() => user.id),
   roleId: uuid("roles_id")
      .notNull()
      .references(() => role.id),
});

export const responsibilityNote = pgTable(
   "responsibility_note",
   {
      id: uuid("id").primaryKey().notNull(),
      lastModifiedBy: varchar("last_modified_by", { length: 255 }),
      lastModifiedDate: timestamp("last_modified_date", { mode: "string" }),
      text: text("text"),
      responsibilityYearId: uuid("resonsibility_year_id")
         .references(() => responsibilityYear.id)
         .notNull(),
   },
   (table) => {
      return {
         uc_responsibility_noteresonsibility_year_id_col: unique("uc_responsibility_noteresonsibility_year_id_col").on(
            table.responsibilityYearId
         ),
      };
   }
);

export const responsibility = pgTable("responsibility", {
   id: uuid("id").primaryKey().notNull(),
   description: varchar("description", { length: 255 }).notNull(),
   name: varchar("name", { length: 255 }).notNull(),
});

export const reportFile = pgTable("gata_report_file", {
   id: uuid("id").primaryKey().notNull(),
   data: text("data"),
   reportId: uuid("report_id").references(() => gataReport.id),
   cloudUrl: varchar("cloud_url", { length: 255 }),
   cloudId: varchar("cloud_id", { length: 255 }),
});

export const contingent = pgTable("gata_contingent", {
   id: uuid("id").primaryKey().notNull(),
   userId: uuid("gata_user_id")
      .references(() => user.id)
      .notNull(),
   isPaid: boolean("is_paid").notNull(),
   year: smallint("year").notNull(),
});

export const responsibilityYear = pgTable("responsibility_year", {
   id: uuid("id").primaryKey().notNull(),
   responsibilityId: uuid("responsibility_id")
      .references(() => responsibility.id)
      .notNull(),
   userId: uuid("user_id")
      .references(() => user.id)
      .notNull(),
   year: smallint("year").default(2022).notNull(),
});

export const databasechangeloglock = pgTable("databasechangeloglock", {
   id: integer("id").primaryKey().notNull(),
   locked: boolean("locked").notNull(),
   lockgranted: timestamp("lockgranted", { mode: "string" }),
   lockedby: varchar("lockedby", { length: 255 }),
});

export const databasechangelog = pgTable("databasechangelog", {
   id: varchar("id", { length: 255 }).notNull(),
   author: varchar("author", { length: 255 }).notNull(),
   filename: varchar("filename", { length: 255 }).notNull(),
   dateexecuted: timestamp("dateexecuted", { mode: "string" }).notNull(),
   orderexecuted: integer("orderexecuted").notNull(),
   exectype: varchar("exectype", { length: 10 }).notNull(),
   md5sum: varchar("md5sum", { length: 35 }),
   description: varchar("description", { length: 255 }),
   comments: varchar("comments", { length: 255 }),
   tag: varchar("tag", { length: 255 }),
   liquibase: varchar("liquibase", { length: 20 }),
   contexts: varchar("contexts", { length: 255 }),
   labels: varchar("labels", { length: 255 }),
   deployment_id: varchar("deployment_id", { length: 10 }),
});

export const user = pgTable("gata_user", {
   id: uuid("id").primaryKey().notNull(),
   subscribe: boolean("subscribe").notNull(),
});

export const gataReport = pgTable("gata_report", {
   id: uuid("id").primaryKey().notNull(),
   content: text("content"),
   createdDate: timestamp("created_date", { mode: "string" }),
   description: varchar("description", { length: 255 }),
   lastModifiedBy: varchar("last_modified_by", { length: 255 }),
   lastModifiedDate: timestamp("last_modified_date", { mode: "string" }),
   title: varchar("title", { length: 255 }).notNull(),
   type: integer("type").notNull(),
   createdBy: uuid("created_by").references(() => user.id),
});

export const externalUserRelations = relations(externalUser, ({ one }) => ({
   user: one(user, {
      fields: [externalUser.userId],
      references: [user.id],
   }),
}));

export const gata_userRelations = relations(user, ({ many }) => ({
   externalUsers: many(externalUser),
   roles: many(userRoles),
   contingents: many(contingent),
   responsibilityYears: many(responsibilityYear),
   gataReports: many(gataReport),
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
