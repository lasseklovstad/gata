import { z } from "zod";
import { zfd } from "zod-form-data";

export const eventSchema = zfd.formData({
   title: zfd.text(
      z.string().trim().min(1, {
         message: "Tittel kan ikke være tom",
      })
   ),
   description: zfd.text(z.string().default("")),
   startDate: zfd.text(z.string().date().optional()),
   startTime: zfd.text(
      z
         .string()
         .regex(/\d{2}:\d{2}/)
         .optional()
   ),
   visibility: zfd.text(z.enum(["everyone", "event-organizers"])),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const createEventMessageSchema = zfd.formData({
   message: zfd.text(
      z.string().trim().min(1, {
         message: "Melding kan ikke være tom",
      })
   ),
});

export const newEventMessageReplySchema = zfd.formData({
   messageId: zfd.text(z.coerce.number()),
   reply: zfd.text(
      z.string().trim().min(1, {
         message: "Melding kan ikke være tom",
      })
   ),
});

export const likeMessageSchema = zfd.formData({
   messageId: zfd.text(z.coerce.number()),
   type: zfd.text(z.string().trim()),
});
