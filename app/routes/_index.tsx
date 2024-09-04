import { unstable_defineLoader as defineLoader } from "@remix-run/node";
import { redirect } from "@remix-run/react";

export const loader = defineLoader(() => {
   return redirect("/home");
});
