import { AppLoadContext } from "@remix-run/node";
import { userRoles } from "db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "db/config.server";

export const getRoles = async (context: AppLoadContext) => {
   return await db.query.role.findMany();
};

export const insertRole = async (context: AppLoadContext, roleId: string, usersId: string) => {
   await db.insert(userRoles).values({ roleId, usersId });
};

export const deleteRole = async (context: AppLoadContext, roleId: string, userId: string) => {
   await db.delete(userRoles).where(and(eq(userRoles.roleId, roleId), eq(userRoles.usersId, userId)));
};
