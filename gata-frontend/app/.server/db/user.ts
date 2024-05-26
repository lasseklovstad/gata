import { AppLoadContext } from "@remix-run/cloudflare";
import { externalUser, user } from "db/schema";
import { eq, isNull } from "drizzle-orm";

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

export const getOptionalUserFromExternalUserId = async (context: AppLoadContext, externalUserId: string) => {
   const userResult = await context.db.query.externalUser.findFirst({
      columns: {},
      where: eq(externalUser.id, externalUserId),
      with: {
         gataUser: {
            with: {
               externalUsers: true,
               roles: { with: { role: true }, columns: { roleId: true } },
               contingents: true,
            },
         },
      },
   });
   if (!userResult) {
      throw new Error("Fant ingen ekstern bruker med id " + externalUserId);
   }
   return userResult.gataUser;
};

export const getRequiredUserFromExternalUserId = async (context: AppLoadContext, externalUserId: string) => {
   const user = await getOptionalUserFromExternalUserId(context, externalUserId);
   if (!user) {
      throw new Error("Fant ingen gata bruker for ekstern bruker med id " + externalUserId);
   }
   return user;
};

export const getUsers = (context: AppLoadContext) => {
   return context.db.query.user.findMany({
      with: { externalUsers: true, roles: { with: { role: true }, columns: { roleId: true } }, contingents: true },
   });
};

export const getNotMemberUsers = (context: AppLoadContext) => {
   return context.db.query.externalUser.findMany({ where: isNull(externalUser.userId) });
};
