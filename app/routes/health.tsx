import { unstable_defineLoader as defineLoader } from "@remix-run/node";

export const loader = defineLoader(() => {
   return new Response("System ready", { status: 200 });
});
