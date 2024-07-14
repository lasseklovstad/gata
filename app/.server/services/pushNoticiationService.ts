import { WebPushError, type PushSubscription } from "web-push";
import webpush from "web-push";

import { env } from "~/utils/env.server";

import { deletePushSubscription } from "../db/pushSubscriptions";

export const sendPushNotification = async (
   subscriptions: PushSubscription[],
   notification: NotificationOptions & { title?: string }
) => {
   await Promise.all(
      subscriptions.map((subscription) =>
         // eslint-disable-next-line import/no-named-as-default-member
         webpush
            .sendNotification(subscription, JSON.stringify(notification), {
               headers: { "Content-Type": "application/json" },
               vapidDetails: {
                  privateKey: env.PWA_PRIVATE_KEY,
                  publicKey: env.PWA_PUBLIC_KEY,
                  subject: "mailto:admin@gataersamla.no",
               },
            })
            .catch(async (error) => {
               console.log(error);
               if (error instanceof WebPushError && error.statusCode === 410) {
                  await deletePushSubscription(error.endpoint);
               }
            })
      )
   );
};
