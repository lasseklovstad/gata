import { AppLoadContext } from "@remix-run/cloudflare";

export const getRoles = (context: AppLoadContext) => {
   return context.db.query.role.findMany();
};
