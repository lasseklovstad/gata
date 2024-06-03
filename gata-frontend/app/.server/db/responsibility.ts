import { AppLoadContext } from "@remix-run/cloudflare";
import { responsibility, responsibilityNote, responsibilityYear } from "db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { ResponsibilitySchema } from "~/utils/formSchema";
import { getPrimaryUser } from "~/utils/userUtils";
import { User } from "./user";

export const getResponsibilities = (context: AppLoadContext) => {
   return context.db.query.responsibility.findMany({ orderBy: asc(responsibility.name) });
};

export const getResponsibility = async (context: AppLoadContext, responsibilityId: string) => {
   const result = await context.db.query.responsibility.findFirst({ where: eq(responsibility.id, responsibilityId) });
   if (!result) {
      throw new Error("Could not find resposibility with id " + responsibilityId);
   }
   return result;
};

export const insertResponsibility = async (context: AppLoadContext, values: ResponsibilitySchema) => {
   await context.db.insert(responsibility).values(values);
};

export const updateResponsibility = async (
   context: AppLoadContext,
   responsibilityId: string,
   values: ResponsibilitySchema
) => {
   await context.db.update(responsibility).set(values).where(eq(responsibility.id, responsibilityId));
};

export const deleteResponsibility = async (context: AppLoadContext, responsibilityId: string) => {
   try {
      await context.db.delete(responsibility).where(eq(responsibility.id, responsibilityId));
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
   await context.db.transaction(async (tx) => {
      const [{ id }] = await tx
         .insert(responsibilityYear)
         .values({ responsibilityId, year, userId })
         .returning({ id: responsibilityYear.id });
      await tx.insert(responsibilityNote).values({
         responsibilityYearId: id,
         lastModifiedBy: getPrimaryUser(loggedInUser).name,
      });
   });
};

export const deleteResponsibilityYear = async (context: AppLoadContext, responsibilityYearId: string) => {
   await context.db.delete(responsibilityYear).where(eq(responsibilityYear.id, responsibilityYearId));
};

export const updateResponsibilityNote = async (
   context: AppLoadContext,
   responsibilityYearId: string,
   text: string,
   loggedInUser: User
) => {
   await context.db
      .update(responsibilityNote)
      .set({ text, lastModifiedDate: sql`now()`, lastModifiedBy: getPrimaryUser(loggedInUser).name })
      .where(eq(responsibilityNote.responsibilityYearId, responsibilityYearId));
};
