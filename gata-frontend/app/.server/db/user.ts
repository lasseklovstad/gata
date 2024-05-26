import { AppLoadContext } from "@remix-run/cloudflare";
import { externalUser, user } from "db/schema";
import { eq } from "drizzle-orm";

export type User = Awaited<ReturnType<typeof getUser>>;

export const getUser = async (context: AppLoadContext, userId: string) => {
   const userResult = await context.db.query.user.findFirst({
      where: eq(user.id, userId),
      with: { externalUsers: true, roles: { with: { role: true }, columns: { roleId: true } }, contingents: true },
   });
   if (!userResult) {
      throw new Error("Fant ingen bruker");
   }
   return userResult;
};

export const getUserFromExternalUserId = async (context: AppLoadContext, externalUserId: string) => {
   const userResult = await context.db.query.user.findFirst({
      with: {
         externalUsers: {
            where: eq(externalUser.id, externalUserId),
         },
         roles: { with: { role: true }, columns: { roleId: true } },
         contingents: true,
      },
   });
   if (!userResult) {
      throw new Error("Fant ingen bruker");
   }
   return userResult;
};

export const getUsers = (context: AppLoadContext) => {
   return context.db.query.user.findMany({
      with: { externalUsers: true, roles: { with: { role: true }, columns: { roleId: true } }, contingents: true },
   });
};
