import { z } from "zod";
import { zfd } from "zod-form-data";

export const memberIntent = {
   deleteUser: "delete-user",
   updateRole: "update-role",
   updateContingent: "update-contingent",
   updateLinkedUsers: "update-linked-users",
   updatePrimaryUserEmail: "update-primary-user-email",
} as const;

const DeleteUserSchema = zfd.formData({
   intent: z.literal(memberIntent.deleteUser),
});
const UpdateRoleSchema = zfd.formData({
   intent: z.literal(memberIntent.updateRole),
   roleId: zfd.text(),
});
const UpdateContingentSchema = zfd.formData({
   intent: z.literal(memberIntent.updateContingent),
   hasPaid: zfd.checkbox({ trueValue: "on" }),
   year: zfd.text(z.coerce.number()),
   amount: zfd.text(z.coerce.number().default(0)),
});
const UpdateLinkedUsersSchema = zfd.formData({
   intent: z.literal(memberIntent.updateLinkedUsers),
   externalUserId: zfd.repeatable(z.array(zfd.text()).min(1)),
});
const UpdatePrimaryUserEmailSchema = zfd.formData({
   intent: z.literal(memberIntent.updatePrimaryUserEmail),
   primaryUserEmail: zfd.text(),
});

export const MemberActionSchema = z.union([
   DeleteUserSchema,
   UpdateRoleSchema,
   UpdateContingentSchema,
   UpdateLinkedUsersSchema,
   UpdatePrimaryUserEmailSchema,
]);
