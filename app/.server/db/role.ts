import { and, eq } from "drizzle-orm";

import { db } from "db/config.server";
import { userRoles } from "db/schema";

export const getRoles = async () => {
   return await db.query.role.findMany();
};

export const insertRole = async (roleId: string, usersId: string) => {
   await db.insert(userRoles).values({ roleId, usersId });
};

export const deleteRole = async (roleId: string, userId: string) => {
   await db.delete(userRoles).where(and(eq(userRoles.roleId, roleId), eq(userRoles.usersId, userId)));
};
