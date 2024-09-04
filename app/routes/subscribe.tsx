import { unstable_defineAction as defineAction } from "@remix-run/node";

import { deletePushSubscription, insertPushSubscription } from "~/.server/db/pushSubscriptions";
import { createAuthenticator } from "~/utils/auth.server";
import { badRequest } from "~/utils/responseUtils";

export const action = defineAction(async ({ request }) => {
   const loggedInUser = await createAuthenticator().getRequiredUser(request);
   const subscription = (await request.json()) as PushSubscriptionJSON;
   if (!subscription.endpoint) {
      return badRequest("Endpoint url required in subscription");
   }
   if (request.method === "POST") {
      await insertPushSubscription(loggedInUser.id, subscription.endpoint, subscription);
      return { ok: true };
   }
   if (request.method === "DELETE") {
      await deletePushSubscription(subscription.endpoint);
      return { ok: true };
   }
   return badRequest("Method not allowed");
});
