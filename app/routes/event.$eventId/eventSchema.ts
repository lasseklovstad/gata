import { z } from "zod";
import { zfd } from "zod-form-data";

export const eventSchema = zfd.formData({
   title: zfd.text(z.string()),
   description: zfd.text(z.string().default("")),
   startDate: zfd.text(z.string().date().optional()),
   startTime: zfd.text(
      z
         .string()
         .regex(/\d{2}:\d{2}/)
         .optional()
   ),
});
