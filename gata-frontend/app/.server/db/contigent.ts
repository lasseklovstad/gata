import { AppLoadContext } from "@remix-run/cloudflare";
import { contingent } from "db/schema";
import { and, eq } from "drizzle-orm";

export const getContingentInfo = (context: AppLoadContext) => {
   return {
      size: context.cloudflare.env.DEFAULT_CONTINGENT_SIZE,
      bank: context.cloudflare.env.CONTINGENT_BANK,
   };
};

export const updateContingent = async (context: AppLoadContext, userId: string, year: number, isPaid: boolean) => {
   await context.db
      .insert(contingent)
      .values({ isPaid, year, userId })
      .onConflictDoUpdate({ target: [contingent.userId, contingent.year], set: { isPaid, year } });
};
