import "dotenv/config";
import { eq } from "drizzle-orm";

import { db } from "./config.server";
import { externalUser, role, user, userRoles } from "./schema";

const seed = async () => {
   const [externalUserResult] = await db
      .select()
      .from(externalUser)
      .where(eq(externalUser.email, "admin@gataersamla.no"));
   const [createdUser] = await db
      .insert(user)
      .values({
         primaryExternalUserId: externalUserResult.id,
         name: externalUserResult.name,
         picture: externalUserResult.picture ?? "/no-profile.jpg",
      })
      .returning({ id: user.id });
   await db.update(externalUser).set({ userId: createdUser.id }).where(eq(externalUser.id, externalUserResult.id));
   const allroles = await db.selectDistinct().from(role);
   await db.insert(userRoles).values(allroles.map((role) => ({ usersId: createdUser.id, roleId: role.id })));
};

await seed();
