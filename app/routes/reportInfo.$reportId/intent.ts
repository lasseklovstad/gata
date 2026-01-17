import { z } from "zod";
import { zfd } from "zod-form-data";

export const reportInfoIntent = {
   updateContentIntent: "update-report-content",
   postFileIntent: "post-file",
} as const;

const UpdateContentSchema = zfd.formData({
   intent: z.literal(reportInfoIntent.updateContentIntent),
   content: zfd.text(),
   close: zfd.text(),
});

const PostFileSchema = zfd.formData({
   intent: z.literal(reportInfoIntent.postFileIntent),
   id: z.string(),
   type: z.string(),
   url: z.string(),
   width: z.coerce.number().optional(),
   height: z.coerce.number().optional(),
});

export const ReportInfoSchema = z.union([UpdateContentSchema, PostFileSchema]);
