import { and, count, desc, eq, inArray, isNull, notInArray, or, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { contingent, externalUser, responsibilityYear, role, user, userRoles } from "db/schema";
import type { Auth0User } from "~/types/Auth0User";
import { RoleName } from "~/utils/roleUtils";

export type User = Awaited<ReturnType<typeof getUser>>;

export const getUser = async (userId: string) => {
   const userResult = await db.query.user.findFirst({
      where: eq(user.id, userId),
      with: {
         externalUsers: true,
         roles: { with: { role: true }, columns: { roleId: true } },
         contingents: true,
         primaryUser: true,
      },
   });
   if (!userResult) {
      throw new Error("Fant ingen bruker");
   }
   return userResult;
};

export const getOptionalUserFromExternalUserId = async (externalUserId: string) => {
   const userResult = await db.query.externalUser.findFirst({
      columns: {},
      where: eq(externalUser.id, externalUserId),
      with: {
         user: {
            with: {
               externalUsers: true,
               roles: { with: { role: true }, columns: { roleId: true } },
               contingents: true,
               primaryUser: true,
            },
         },
      },
   });
   return userResult?.user;
};

export const getUsers = () => {
   return db.query.user.findMany({
      with: {
         externalUsers: true,
         roles: { with: { role: true }, columns: { roleId: true } },
         contingents: true,
         primaryUser: true,
      },
   });
};

export const getNotMemberUsers = () => {
   return db.query.externalUser.findMany({ where: isNull(externalUser.userId) });
};

export const deleteUser = async (userId: string) => {
   await db.delete(user).where(eq(user.id, userId));
};

export type ResponsibilityYear = Awaited<ReturnType<typeof getResponsibilityYears>>[number];

export const getResponsibilityYears = (userId: string) => {
   return db.query.responsibilityYear.findMany({
      where: eq(responsibilityYear.userId, userId),
      with: {
         responsibility: true,
         note: true,
      },
      orderBy: desc(responsibilityYear.year),
   });
};

export const insertOrUpdateExternalUser = async ({ email, id, name, photo }: Auth0User) => {
   const values = {
      email,
      lastLogin: sql`(CURRENT_TIMESTAMP)`,
      name: name ?? email,
      picture: photo,
   };
   return await db
      .insert(externalUser)
      .values({
         id,
         ...values,
      })
      .onConflictDoUpdate({ target: externalUser.id, set: values })
      .returning({ id: externalUser.id });
};

export const getNumberOfAdmins = async () => {
   return await db
      .select({ count: count() })
      .from(user)
      .leftJoin(userRoles, eq(user.id, userRoles.usersId))
      .leftJoin(role, eq(userRoles.roleId, role.id))
      .where(eq(role.roleName, RoleName.Admin));
};

export const insertUser = async (auth0UserId: string, roleName?: RoleName) => {
   return await db.transaction(async (tx) => {
      const [externalUserResult] = await tx.select().from(externalUser).where(eq(externalUser.id, auth0UserId));
      const [createdUser] = await tx
         .insert(user)
         .values({
            primaryExternalUserId: auth0UserId,
            name: externalUserResult.name,
            picture: externalUserResult.picture ?? "/no-profile.jpg",
         })
         .returning({ id: user.id });
      await tx.update(externalUser).set({ userId: createdUser.id }).where(eq(externalUser.id, auth0UserId));
      if (roleName !== undefined) {
         const [userRole] = await tx.selectDistinct().from(role).where(eq(role.roleName, roleName));
         await tx.insert(userRoles).values({ usersId: createdUser.id, roleId: userRole.id });
      }
      return createdUser.id;
   });
};

export const updateUser = async (
   userId: string,
   values: Partial<Omit<typeof user.$inferSelect, "id" | "primaryExternalUserId">>
) => {
   await db.update(user).set(values).where(eq(user.id, userId));
};

export const updateLinkedExternalUsers = async (userId: string, externalUserIds: string[]) => {
   await db.transaction(async (tx) => {
      await tx
         .update(externalUser)
         .set({ userId: null })
         .where(and(eq(externalUser.userId, userId), notInArray(externalUser.id, externalUserIds)));
      await tx.update(externalUser).set({ userId }).where(inArray(externalUser.id, externalUserIds));
   });
};

export const updatePrimaryEmail = async (userId: string, primaryExternalUserId: string) => {
   await db.update(user).set({ primaryExternalUserId }).where(eq(user.id, userId));
};

export const deleteExternalUser = async (externalUserId: string) => {
   await db.delete(externalUser).where(eq(externalUser.id, externalUserId));
};

export const getSubscribedUsers = async () => {
   return await db
      .select({ id: user.id, name: externalUser.name, email: externalUser.email })
      .from(user)
      .innerJoin(externalUser, eq(externalUser.id, user.primaryExternalUserId))
      .innerJoin(userRoles, eq(userRoles.usersId, user.id))
      .innerJoin(role, eq(role.id, userRoles.roleId))
      .where(and(eq(user.subscribe, true), eq(role.roleName, RoleName.Member)));
};

export const getUsersThatHasNotPaidContingent = async (year: number) => {
   return await db
      .select({ id: user.id, name: externalUser.name, email: externalUser.email, amount: contingent.amount })
      .from(user)
      .leftJoin(contingent, and(eq(contingent.userId, user.id), eq(contingent.year, year)))
      .innerJoin(externalUser, eq(externalUser.id, user.primaryExternalUserId))
      .innerJoin(userRoles, eq(userRoles.usersId, user.id))
      .innerJoin(role, eq(role.id, userRoles.roleId))
      .where(
         and(
            // If nothing registered contingent isPaid value is null
            or(eq(contingent.isPaid, false), isNull(contingent.isPaid)),
            eq(role.roleName, RoleName.Member)
         )
      );
};
