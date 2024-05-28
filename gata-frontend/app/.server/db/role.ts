import { AppLoadContext } from "@remix-run/cloudflare";

export const getRoles = async (context: AppLoadContext) => {
   return await context.db.query.role.findMany();
};
