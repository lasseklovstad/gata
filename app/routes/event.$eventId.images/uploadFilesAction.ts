import { z } from "zod";
import { zfd } from "zod-form-data";

export const uploadFilesIntent = "upload-media";
export const UploadFilesSchema = zfd.formData({
   intent: zfd.text(z.literal(uploadFilesIntent)),
   files: zfd.repeatable(
      z.array(
         z.object({
            id: z.string(),
            type: z.string(),
            width: z.coerce.number().optional(),
            height: z.coerce.number().optional(),
         })
      )
   ),
});
