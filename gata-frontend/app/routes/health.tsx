import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { client } from "~/utils/client";

export const loader = async ({
   context: {
      cloudflare: { env },
   },
}: LoaderFunctionArgs) => {
   await client("system/health", { baseUrl: env.BACKEND_BASE_URL });
   return new Response("System ready", { status: 200 });
};
