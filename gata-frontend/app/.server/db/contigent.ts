import { AppLoadContext } from "@remix-run/cloudflare";

export const getContingentInfo = (context: AppLoadContext) => {
   return {
      size: context.cloudflare.env.DEFAULT_CONTINGENT_SIZE,
      bank: context.cloudflare.env.CONTINGENT_BANK,
   };
};
