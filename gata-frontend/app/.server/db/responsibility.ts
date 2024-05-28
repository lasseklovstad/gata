import { AppLoadContext } from "@remix-run/cloudflare";
import { responsibility } from "db/schema";
import { eq } from "drizzle-orm";

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
