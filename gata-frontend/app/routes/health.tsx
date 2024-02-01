import { client } from "~/utils/client";

export const loader = async () => {
   await client("system/health");
   return new Response("System ready", { status: 200 });
};
