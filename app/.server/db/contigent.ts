import { db } from "db/config.server";
import { contingent } from "db/schema";

export const getContingentInfo = () => {
   return {
      size: process.env.DEFAULT_CONTINGENT_SIZE,
      bank: process.env.CONTINGENT_BANK,
   };
};

export const updateContingent = async (userId: string, year: number, isPaid: boolean, amount: number) => {
   await db
      .insert(contingent)
      .values({ isPaid, year, userId, amount })
      .onConflictDoUpdate({ target: [contingent.userId, contingent.year], set: { isPaid, year, amount } });
};
