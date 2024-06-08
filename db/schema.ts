import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("gata_user", {
   id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
   subscribe: integer("subscribe", { mode: "boolean" }).default(false).notNull(),
   primaryExternalUserId: text("primary_external_user_id").notNull().unique(),
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
