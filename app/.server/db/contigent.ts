import { AppLoadContext } from "@remix-run/node";
import { db } from "db/config.server";
import { contingent } from "db/schema";
import { env } from "~/utils/env.server";

export const getContingentInfo = (context: AppLoadContext) => {
   return {
      size: env.DEFAULT_CONTINGENT_SIZE,
      bank: env.CONTINGENT_BANK,
   };
};

export const updateContingent = async (context: AppLoadContext, userId: string, year: number, isPaid: boolean) => {
   await db
      .insert(contingent)
      .values({ isPaid, year, userId })
      .onConflictDoUpdate({ target: [contingent.userId, contingent.year], set: { isPaid, year } });
};
