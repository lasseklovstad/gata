import { WebPushError, type PushSubscription } from "web-push";
import webpush from "web-push";

import { env } from "~/utils/env.server";
import { deletePushSubscription } from "../db/pushSubscriptions";

webpush.setGCMAPIKey(env.GCM_API_KEY);
webpush.setVapidDetails("mailto:admin@gataersamla.no", env.PWA_PUBLIC_KEY, env.PWA_PRIVATE_KEY);

export const sendPushNotification = async (subscriptions: PushSubscription[], messageBody: string) => {
   await Promise.all(
      subscriptions.map((subscription) =>
         webpush
            .sendNotification(subscription, messageBody, { headers: { "Content-Type": "application/json" } })
            .catch(async (error) => {
               console.log(error);
               if (error instanceof WebPushError && error.statusCode === 410) {
                  await deletePushSubscription(error.endpoint);
               }
            })
      )
   );
};
