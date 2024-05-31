import { AppLoadContext } from "@remix-run/cloudflare";
import { userRoles } from "db/schema";
import { and, eq } from "drizzle-orm";
import { User } from "./user";

export const getRoles = async (context: AppLoadContext) => {
   return await context.db.query.role.findMany();
};

export const insertRole = async (context: AppLoadContext, roleId: string, usersId: string) => {
   await context.db.insert(userRoles).values({ roleId, usersId });
};

export const deleteRole = async (context: AppLoadContext, roleId: string, userId: string) => {
   await context.db.delete(userRoles).where(and(eq(userRoles.roleId, roleId), eq(userRoles.usersId, userId)));
};