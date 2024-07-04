import { z } from "zod";
import { zfd } from "zod-form-data";

export const pollVoteSchema = zfd.formData({
   pollId: zfd.numeric(),
   userId: zfd.text(),
   options: zfd.repeatable(z.array(z.coerce.number())),
});

export type PollVoteSchema = z.infer<typeof pollVoteSchema>;

export const pollUpdateSchema = zfd.formData({
   pollId: zfd.numeric(),
   name: zfd.text(z.string()),
   canAddSuggestions: zfd.checkbox(),
   isFinished: zfd.checkbox(),
});

export type UpdatePollSchema = z.infer<typeof pollUpdateSchema>;

export const pollDeleteSchema = zfd.formData({
   pollId: zfd.numeric(),
});

export const newPollSchema = zfd
   .formData({
      name: zfd.text(z.string()),
      // format: yyyy-MM-dd
      dateOption: zfd.repeatable(z.array(z.string().date())),
      textOption: zfd.repeatable(z.array(z.string().min(1, { message: "Alternativ kan ikke være tomt" }))),
      isAnonymous: zfd.checkbox(),
      canAddSuggestions: zfd.checkbox(),
      canSelectMultiple: zfd.checkbox(),
      type: zfd.text(z.enum(["text", "date"])),
   })
   .refine((data) => (data.type === "text" ? data.textOption.length > 1 : true), {
      message: "Det må være mer enn ett alternativ",
      path: ["textOption"], // path of error
   })
   .refine((data) => (data.type === "date" ? data.dateOption.length > 1 : true), {
      message: "Det må være mer enn ett alternativ",
      path: ["dateOption"], // path of error
   });

export type NewPollSchema = z.infer<typeof newPollSchema>;

export const addPollOptionsSchema = zfd
   .formData({
      dateOption: zfd.repeatable(z.array(z.string().date())),
      textOption: zfd.repeatable(z.array(z.string().min(1, { message: "Alternativ kan ikke være tomt" }))),
      pollId: zfd.numeric(),
      // Only for validations
      type: zfd.text(z.enum(["text", "date"])),
   })
   .refine((data) => (data.type === "text" ? data.textOption.length > 0 : true), {
      message: "Det må være minst ett alternativ",
      path: ["textOption"], // path of error
   })
   .refine((data) => (data.type === "date" ? data.dateOption.length > 0 : true), {
      message: "Det må være minst ett alternativ",
      path: ["dateOption"], // path of error
   });
