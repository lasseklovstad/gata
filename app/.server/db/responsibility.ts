import { asc, eq, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { responsibility, responsibilityNote, responsibilityYear } from "db/schema";
import type { ResponsibilitySchema } from "~/utils/formSchema";

import type { User } from "./user";

export const getResponsibilitiesWithCurrentlyResponsibleUsername = async () => {
   const currentYear = new Date().getFullYear();

   return await db.query.responsibility.findMany({
      with: { responsibilityYears: { with: { user: true }, where: eq(responsibilityYear.year, currentYear) } },
      orderBy: asc(responsibility.name),
   });
};

export const getResponsibilities = async () => {
   return await db.select().from(responsibility).orderBy(asc(responsibility.name));
};

export const getResponsibility = async (responsibilityId: string) => {
   const result = await db.query.responsibility.findFirst({ where: eq(responsibility.id, responsibilityId) });
   if (!result) {
      throw new Error("Could not find resposibility with id " + responsibilityId);
   }
   return result;
};

export const insertResponsibility = async (values: ResponsibilitySchema) => {
   await db.insert(responsibility).values(values);
};

export const updateResponsibility = async (responsibilityId: string, values: ResponsibilitySchema) => {
   await db.update(responsibility).set(values).where(eq(responsibility.id, responsibilityId));
};

export const deleteResponsibility = async (responsibilityId: string) => {
   try {
      await db.delete(responsibility).where(eq(responsibility.id, responsibilityId));
   } catch (error) {
      console.log(error);
      throw new Error("Det oppstod en feil ved sletting av ansvarspost");
   }
};

export const insertResponsibilityYear = async (
   userId: string,
   responsibilityId: string,
   year: number,
   loggedInUser: User
) => {
   await db.transaction(async (tx) => {
      const [{ id }] = await tx
         .insert(responsibilityYear)
         .values({ responsibilityId, year, userId })
         .returning({ id: responsibilityYear.id });
      await tx.insert(responsibilityNote).values({
         responsibilityYearId: id,
         lastModifiedBy: loggedInUser.name,
      });
   });
};

export const deleteResponsibilityYear = async (responsibilityYearId: string) => {
   await db.delete(responsibilityYear).where(eq(responsibilityYear.id, responsibilityYearId));
};

export const updateResponsibilityNote = async (responsibilityYearId: string, text: string, loggedInUser: User) => {
   await db
      .update(responsibilityNote)
      .set({ text, lastModifiedDate: sql`(CURRENT_TIMESTAMP)`, lastModifiedBy: loggedInUser.name })
      .where(eq(responsibilityNote.responsibilityYearId, responsibilityYearId));
};
