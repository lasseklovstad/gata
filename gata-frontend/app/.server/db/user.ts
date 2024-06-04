import { AppLoadContext } from "@remix-run/cloudflare";
import { contingent, externalUser, responsibilityYear, role, user, userRoles } from "db/schema";
import { and, count, desc, eq, inArray, isNull, ne, notInArray, or, sql } from "drizzle-orm";
import { Auth0User } from "~/types/Auth0User";
import { RoleName } from "~/utils/roleUtils";

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
         user: {
            with: {
               externalUsers: true,
               roles: { with: { role: true }, columns: { roleId: true } },
               contingents: true,
            },
         },
      },
   });
   return userResult?.user;
};

export const getUsers = (context: AppLoadContext) => {
   return context.db.query.user.findMany({
      with: { externalUsers: true, roles: { with: { role: true }, columns: { roleId: true } }, contingents: true },
   });
};

export const getNotMemberUsers = (context: AppLoadContext) => {
   return context.db.query.externalUser.findMany({ where: isNull(externalUser.userId) });
};

export const deleteUser = async (context: AppLoadContext, userId: string) => {
   await context.db.transaction(async (tx) => {
      // Then remove the user
      await tx.update(externalUser).set({ primaryUser: false }).where(eq(externalUser.userId, userId));
      await tx.delete(user).where(eq(user.id, userId));
   });
};

export type ResponsibilityYear = Awaited<ReturnType<typeof getResponsibilityYears>>[number];

export const getResponsibilityYears = (context: AppLoadContext, userId: string) => {
   return context.db.query.responsibilityYear.findMany({
      where: eq(responsibilityYear.userId, userId),
      with: {
         responsibility: true,
         note: true,
      },
      orderBy: desc(responsibilityYear.year),
   });
};

export const insertOrUpdateExternalUser = async (context: AppLoadContext, auth0User: Auth0User) => {
   const email = auth0User.profile.emails && auth0User.profile.emails[0];
   const photo = auth0User.profile.photos && auth0User.profile.photos[0];
   const id = auth0User.profile.id;
   if (!id) {
      throw new Error("Bruker har ikke en id!");
   }
   if (!email?.value) {
      throw new Error("Bruker har ikke en email?! " + id);
   }
   const values = {
      email: email.value,
      lastLogin: sql`now()`,
      name: auth0User.profile.displayName ?? email.value,
      picture: photo?.value,
   };
   return await context.db
      .insert(externalUser)
      .values({
         id,
         primaryUser: false,
         ...values,
      })
      .onConflictDoUpdate({ target: externalUser.id, set: values })
      .returning({ id: externalUser.id });
};

export const getNumberOfAdmins = async (context: AppLoadContext) => {
   return await context.db
      .select({ count: count() })
      .from(user)
      .leftJoin(userRoles, eq(user.id, userRoles.usersId))
      .leftJoin(role, eq(userRoles.roleId, role.id))
      .where(eq(role.roleName, RoleName.Admin));
};

export const insertUser = async (context: AppLoadContext, auth0UserId: string, roleName?: RoleName) => {
   await context.db.transaction(async (tx) => {
      const [createdUser] = await tx.insert(user).values({}).returning({ id: user.id });
      await tx
         .update(externalUser)
         .set({ userId: createdUser.id, primaryUser: true })
         .where(eq(externalUser.id, auth0UserId));
      if (roleName !== undefined) {
         const [userRole] = await tx.selectDistinct().from(role).where(eq(role.roleName, roleName));
         await tx.insert(userRoles).values({ usersId: createdUser.id, roleId: userRole.id });
      }
   });
};

export const updateUserSubscribe = async (context: AppLoadContext, userId: string) => {
   await context.db
      .update(user)
      .set({ subscribe: sql`not ${user.subscribe}` })
      .where(eq(user.id, userId));
};

export const updateLinkedExternalUsers = async (context: AppLoadContext, userId: string, externalUserIds: string[]) => {
   await context.db.transaction(async (tx) => {
      await tx
         .update(externalUser)
         .set({ userId: null })
         .where(and(eq(externalUser.userId, userId), notInArray(externalUser.id, externalUserIds)));
      await tx.update(externalUser).set({ userId }).where(inArray(externalUser.id, externalUserIds));
   });
};

export const updatePrimaryEmail = async (context: AppLoadContext, userId: string, primaryExternalUserId: string) => {
   await context.db.transaction(async (tx) => {
      await tx
         .update(externalUser)
         .set({ primaryUser: false })
         .where(and(eq(externalUser.userId, userId), ne(externalUser.id, primaryExternalUserId)));
      await tx
         .update(externalUser)
         .set({ primaryUser: true })
         .where(and(eq(externalUser.userId, userId), eq(externalUser.id, primaryExternalUserId)));
   });
};

export const deleteExternalUser = async (context: AppLoadContext, externalUserId: string) => {
   await context.db.delete(externalUser).where(eq(externalUser.id, externalUserId));
};

export const getSubscribedUsers = async (context: AppLoadContext) => {
   return await context.db
      .select({ id: user.id, name: externalUser.name, email: externalUser.email })
      .from(user)
      .innerJoin(externalUser, eq(externalUser.userId, user.id))
      .innerJoin(userRoles, eq(userRoles.usersId, user.id))
      .innerJoin(role, eq(role.id, userRoles.roleId))
      .where(and(eq(externalUser.primaryUser, true), eq(user.subscribe, true), eq(role.roleName, RoleName.Member)));
};

export const getUsersThatHasNotPaidContingent = async (context: AppLoadContext, year: number) => {
   return await context.db
      .select({ id: user.id, name: externalUser.name, email: externalUser.email })
      .from(user)
      .leftJoin(contingent, and(eq(contingent.userId, user.id), eq(contingent.year, year)))
      .innerJoin(externalUser, eq(externalUser.userId, user.id))
      .innerJoin(userRoles, eq(userRoles.usersId, user.id))
      .innerJoin(role, eq(role.id, userRoles.roleId))
      .where(
         and(
            eq(externalUser.primaryUser, true),
            // If nothing registered contingent isPaid value is null
            or(eq(contingent.isPaid, false), isNull(contingent.isPaid)),
            eq(role.roleName, RoleName.Member)
         )
      );
};
