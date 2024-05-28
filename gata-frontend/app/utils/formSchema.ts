import { z } from "zod";
import { zfd } from "zod-form-data";

export const responsibilitySchema = zfd.formData({
   name: zfd.text(z.string({ required_error: "Navn må fylles ut" })),
   description: zfd.text(z.string().default("")),
});

export type ResponsibilitySchema = z.infer<typeof responsibilitySchema>;

export const reportSchema = zfd.formData({
   title: zfd.text(z.string({ required_error: "Tittel må fylles ut" })),
   description: zfd.text(z.string().default("")),
   type: zfd.text(z.enum(["NEWS", "DOCUMENT"])),
});

export type ReportSchema = z.infer<typeof reportSchema>;
