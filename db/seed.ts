import "dotenv/config";
import { eq } from "drizzle-orm";

import { db } from "./config.server";
import { externalUser, role, user, userRoles } from "./schema";

const seed = async () => {
   await db.transaction(async (tx) => {
      const [externalUserResult] = await tx
         .select()
         .from(externalUser)
         .where(eq(externalUser.email, "admin@gataersamla.no"));

      if (!externalUserResult) {
         const allExternalUsers = await tx.select().from(externalUser);
         throw new Error("Can't find admin, users available: " + allExternalUsers.map((user) => user.email).join(", "));
      }
      const [createdUser] = await tx
         .insert(user)
         .values({
            primaryExternalUserId: externalUserResult.id,
            name: externalUserResult.name,
            picture: externalUserResult.picture ?? "/no-profile.jpg",
         })
         .returning({ id: user.id });
      await tx.update(externalUser).set({ userId: createdUser.id }).where(eq(externalUser.id, externalUserResult.id));
      const allroles = await tx.selectDistinct().from(role);
      await tx.insert(userRoles).values(allroles.map((role) => ({ usersId: createdUser.id, roleId: role.id })));
   });
};

await seed();
