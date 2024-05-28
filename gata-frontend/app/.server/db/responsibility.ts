import { AppLoadContext } from "@remix-run/cloudflare";
import { responsibility } from "db/schema";
import { eq, sql } from "drizzle-orm";
import { ResponsibilitySchema } from "~/utils/formSchema";

export const getResponsibilities = (context: AppLoadContext) => {
   return context.db.query.responsibility.findMany();
};

export const getResponsibility = async (context: AppLoadContext, responsibilityId: string) => {
   const result = await context.db.query.responsibility.findFirst({ where: eq(responsibility.id, responsibilityId) });
   if (!result) {
      throw new Error("Could not find resposibility with id " + responsibilityId);
   }
   return result;
};

export const insertResponsibility = async (context: AppLoadContext, values: ResponsibilitySchema) => {
   console.log(values);
   await context.db.insert(responsibility).values({ id: sql`gen_random_uuid()`, ...values });
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
