import { useState } from "react";
import { Form, Link } from "react-router";
import type { PushSubscription } from "web-push";
import { z } from "zod";

import { getAllSubscriptions, getSubscriptionByUserId } from "~/.server/db/pushSubscriptions";
import { getUser, getUsers } from "~/.server/db/user";
import { sendPushNotification } from "~/.server/services/pushNoticiationService";
import { sendMail } from "~/.server/services/sendgrid";
import { Button } from "~/components/ui/button";
import { NativeSelect } from "~/components/ui/native-select";
import { getRequiredUser } from "~/utils/auth.server";
import { RoleName } from "~/utils/roleUtils";

import type { Route } from "./+types/sentry-test";

export const loader = async ({ request }: Route.LoaderArgs) => {
   await getRequiredUser(request, [RoleName.Admin]);
   const search = new URL(request.url).searchParams;
   if (search.get("error") === "true") {
      throw new Error("Error in loader...");
   }
   return {
      users: await getUsers(),
      subscriptions: await getAllSubscriptions(""),
   };
};

export const action = async ({ request }: Route.ActionArgs) => {
   await getRequiredUser(request, [RoleName.Admin]);
   const formData = await request.formData();
   const intent = formData.get("intent");
   if (intent === "sentry-error") {
      throw new Error("Error in action...");
   } else if (intent === "email-test") {
      const userId = z.string().parse(formData.get("user"));
      const user = await getUser(userId);
      await sendMail({
         html: `
      <h1>Dette er en test</h1>
      <p>Hvis du ser denne mail kan du ignorere den!</p>
      `,
         to: [{ email: user.primaryUser.email }],
         subject: "Dette er en test",
      });
   } else if (intent === "pwa-test") {
      const userId = z.string().parse(formData.get("user"));
      const subscriptions = await getSubscriptionByUserId(userId);
      await sendPushNotification(
         subscriptions.map((s) => s.subscription as PushSubscription),
         {
            body: `📝 Dette er en test`,
            data: { url: `/sentry-test` },
            icon: "/logo192.png",
         }
      );
   }
};

export default function SentryTest({ loaderData: { users, subscriptions } }: Route.ComponentProps) {
   const [throwError, setThrowError] = useState(false);
   if (throwError) {
      throw new Error("Error in client...");
   }
   return (
      <main className="p-8 flex flex-col gap-2 items-start">
         <Button
            onClick={() => {
               setThrowError(true);
            }}
         >
            Trigger error on client
         </Button>
         <Button as={Link} to={{ search: "?error=true" }}>
            Navigate to error in loader
         </Button>
         <Form method="POST">
            <Button variant="outline" type="submit" name="intent" value="sentry-error">
               Trigger error in action
            </Button>
         </Form>
         <Form method="POST" className="flex gap-2">
            <NativeSelect className="w-fit min-w-60 mb-4" name="user">
               <option value="">Alle medlemmer</option>
               {users.map((user) => (
                  <option key={user.id} value={user.id}>
                     {user.name}
                  </option>
               ))}
            </NativeSelect>
            <Button variant="outline" type="submit" name="intent" value="email-test">
               Send test email
            </Button>
         </Form>
         <Form method="POST" className="flex gap-2">
            <NativeSelect className="w-fit min-w-60 mb-4" name="user">
               <option value="">Alle medlemmer</option>
               {users
                  .filter((user) => subscriptions.find((s) => s.userId === user.id))
                  .map((user) => (
                     <option key={user.id} value={user.id}>
                        {user.name}
                     </option>
                  ))}
            </NativeSelect>
            <Button variant="outline" type="submit" name="intent" value="pwa-test">
               Send test notification
            </Button>
         </Form>
      </main>
   );
}
