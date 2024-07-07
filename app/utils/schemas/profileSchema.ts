import { NodeOnDiskFile } from "@remix-run/node";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const profileSchema = zfd.formData({
   name: zfd.text(z.string()),
   picture: z.union([z.instanceof(File), z.instanceof(NodeOnDiskFile)]).optional(),
   pictureCropX: zfd.text(z.coerce.number()),
   pictureCropY: zfd.text(z.coerce.number()),
   pictureCropWidth: zfd.text(z.coerce.number()),
   pictureCropHeight: zfd.text(z.coerce.number()),
   emailSubscription: zfd.checkbox(),
   pushSubscription: zfd.checkbox(),
});
