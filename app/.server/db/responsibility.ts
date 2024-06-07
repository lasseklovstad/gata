import { AppLoadContext } from "@remix-run/node";
import { responsibility, responsibilityNote, responsibilityYear } from "db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { ResponsibilitySchema } from "~/utils/formSchema";
import { User } from "./user";
import { db } from "db/config.server";

export const getResponsibilities = (context: AppLoadContext) => {
   return db.query.responsibility.findMany({ orderBy: asc(responsibility.name) });
};

export const getResponsibility = async (context: AppLoadContext, responsibilityId: string) => {
   const result = await db.query.responsibility.findFirst({ where: eq(responsibility.id, responsibilityId) });
   if (!result) {
      throw new Error("Could not find resposibility with id " + responsibilityId);
   }
   return result;
};

export const insertResponsibility = async (context: AppLoadContext, values: ResponsibilitySchema) => {
   await db.insert(responsibility).values(values);
};

export const updateResponsibility = async (
   context: AppLoadContext,
   responsibilityId: string,
   values: ResponsibilitySchema
) => {
   await db.update(responsibility).set(values).where(eq(responsibility.id, responsibilityId));
};

export const deleteResponsibility = async (context: AppLoadContext, responsibilityId: string) => {
   try {
      await db.delete(responsibility).where(eq(responsibility.id, responsibilityId));
   } catch (error) {
      console.log(error);
      throw new Error("Det oppstod en feil ved sletting av ansvarspost");
   }
};

export const insertResponsibilityYear = async (
   context: AppLoadContext,
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
         lastModifiedBy: loggedInUser.primaryUser.name,
      });
   });
};

export const deleteResponsibilityYear = async (context: AppLoadContext, responsibilityYearId: string) => {
   await db.delete(responsibilityYear).where(eq(responsibilityYear.id, responsibilityYearId));
};

export const updateResponsibilityNote = async (
   context: AppLoadContext,
   responsibilityYearId: string,
   text: string,
   loggedInUser: User
) => {
   await db
      .update(responsibilityNote)
      .set({ text, lastModifiedDate: sql`(CURRENT_TIMESTAMP)`, lastModifiedBy: loggedInUser.primaryUser.name })
      .where(eq(responsibilityNote.responsibilityYearId, responsibilityYearId));
};
