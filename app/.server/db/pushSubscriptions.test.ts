import { describe, expect, it } from "vitest";

import { RoleName } from "~/utils/roleUtils";

import { insertEvent, insertEventMessage, insertEventMessageReply } from "./gataEvent";
import { getAllSubscriptionsInvolvedInMessage, insertPushSubscription } from "./pushSubscriptions";
import { insertOrUpdateExternalUser, insertUser } from "./user";

describe("getAllSubscriptionsInvolvedInMessage", () => {
   it("should return the user that created the message and the user that replied when a new user replies", async () => {
      const userId1 = await createUserWithSubscription("lasse");
      const userId2 = await createUserWithSubscription("sigurd");
      const userId3 = await createUserWithSubscription("magnus");

      const eventId = await insertEvent({ title: "Test event", createdBy: userId1, description: "" });
      const messageId = await insertEventMessage(eventId, userId1, "Hva skjer?");
      await insertEventMessageReply(userId2, messageId, "Ikke så mye");
      await insertEventMessageReply(userId3, messageId, "Ikke så mye her heller");

      const result = await getAllSubscriptionsInvolvedInMessage(messageId, userId3);
      expect(result.length).toBe(2);
      expect(result).toStrictEqual(
         expect.arrayContaining([
            expect.objectContaining({ userId: userId1 }),
            expect.objectContaining({ userId: userId2 }),
         ])
      );
   });
   it("should return the users that has replied to the message when the message creator replies", async () => {
      const userId1 = await createUserWithSubscription("lasse");
      const userId2 = await createUserWithSubscription("sigurd");
      const userId3 = await createUserWithSubscription("magnus");

      const eventId = await insertEvent({ title: "Test event", createdBy: userId1, description: "" });
      const messageId = await insertEventMessage(eventId, userId1, "Hva skjer?");
      await insertEventMessageReply(userId2, messageId, "Ikke så mye");
      await insertEventMessageReply(userId3, messageId, "Ikke så mye her heller");
      await insertEventMessageReply(userId1, messageId, "okei...");

      const result = await getAllSubscriptionsInvolvedInMessage(messageId, userId1);
      expect(result.length).toBe(2);
      expect(result).toStrictEqual(
         expect.arrayContaining([
            expect.objectContaining({ userId: userId3 }),
            expect.objectContaining({ userId: userId2 }),
         ])
      );
   });
   it("should return the users that has replied to the message when the message creator replies and users has replied multiple times", async () => {
      const userId1 = await createUserWithSubscription("lasse");
      const userId2 = await createUserWithSubscription("sigurd");
      const userId3 = await createUserWithSubscription("magnus");

      const eventId = await insertEvent({ title: "Test event", createdBy: userId1, description: "" });
      const messageId = await insertEventMessage(eventId, userId1, "Hva skjer?");
      await insertEventMessageReply(userId2, messageId, "Ikke så mye");
      await insertEventMessageReply(userId3, messageId, "Ikke så mye her heller 1");
      await insertEventMessageReply(userId3, messageId, "Ikke så mye her heller 2");
      await insertEventMessageReply(userId3, messageId, "Ikke så mye her heller 3");
      await insertEventMessageReply(userId1, messageId, "okei...");

      const result = await getAllSubscriptionsInvolvedInMessage(messageId, userId1);
      expect(result.length).toBe(2);
      expect(result).toStrictEqual(
         expect.arrayContaining([
            expect.objectContaining({ userId: userId3 }),
            expect.objectContaining({ userId: userId2 }),
         ])
      );
   });
});

async function createUserWithSubscription(name: string) {
   const [externalUser] = await insertOrUpdateExternalUser({
      email: `${name}@gmail.com`,
      name,
      id: crypto.randomUUID(),
      photo: "photo.png",
   });
   const userId = await insertUser(externalUser.id, RoleName.Member);
   await insertPushSubscription(userId, `https://push.endpoint.${crypto.randomUUID()}.com`, {});
   return userId;
}
