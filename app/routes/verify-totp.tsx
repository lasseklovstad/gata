// app/routes/verify.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { FormControl, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Typography } from "~/components/ui/typography";

import { createAuthenticator } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
   const { authenticator, getSession, commitSession } = createAuthenticator();
   await authenticator.isAuthenticated(request, {
      successRedirect: "/home",
   });

   const session = await getSession(request.headers.get("cookie"));
   const authEmail = session.get("auth:email");
   const authError = session.get(authenticator.sessionErrorKey);
   if (!authEmail) return redirect("/login");

   // Commit session to clear any `flash` error message.
   return json(
      { authError },
      {
         headers: {
            "set-cookie": await commitSession(session),
         },
      }
   );
}

export async function action({ request }: ActionFunctionArgs) {
   const { authenticator } = createAuthenticator();
   const url = new URL(request.url);
   const currentPath = url.pathname;

   await authenticator.authenticate("TOTP", request, {
      successRedirect: currentPath,
      failureRedirect: currentPath,
   });
}

export default function Verify() {
   const { authError } = useLoaderData<typeof loader>();

   return (
      <PageLayout>
         {/* Code Verification Form */}
         <Form method="POST" className="space-y-2">
            <FormItem name="code" className="max-w-56">
               <FormLabel>Kode</FormLabel>
               <FormControl
                  render={(props) => <Input {...props} type="text" placeholder="Skriv inn kode..." required />}
               />
            </FormItem>
            <Button type="submit">Gå videre</Button>
         </Form>

         {/* Renders the form that requests a new code. */}
         {/* Email input is not required, it's already stored in Session. */}
         <Form method="POST" className="my-2">
            <Button variant="outline" type="submit">
               Send ny kode
            </Button>
         </Form>

         {/* Errors Handling. */}
         <Typography className="text-red-500">{authError?.message}</Typography>
      </PageLayout>
   );
}
