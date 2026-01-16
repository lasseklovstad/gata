import { z } from "zod";
import { zfd } from "zod-form-data";

export const profileSchema = zfd.formData({
   intent: zfd.text(z.literal("updateProfile")),
   name: zfd.text(z.string()),
   picture: zfd.text(z.string()).optional(),
   originalPicture: zfd.text(z.string()).optional(),
   emailSubscription: zfd.checkbox(),
   pushSubscription: zfd.checkbox(),
});
