import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { FormControl, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Typography } from "~/components/ui/typography";
import { HoneypotInputs } from "remix-utils/honeypot/react";

import { createAuthenticator } from "~/utils/auth.server";
import { Honeypot } from "remix-utils/honeypot/server";
import { honeypot } from "~/utils/honeypot.server";

export async function loader({ request }: LoaderFunctionArgs) {
   const { authenticator, getSession, commitSession } = createAuthenticator();
   await authenticator.isAuthenticated(request, {
      successRedirect: "/",
   });
   const session = await getSession(request.headers.get("Cookie"));
   const authError = session.get(authenticator.sessionErrorKey);

   // Commit session to clear any `flash` error message.
   return json(
      { authError, honeypot: honeypot.getInputProps() },
      {
         headers: {
            "set-cookie": await commitSession(session),
         },
      }
   );
}

export async function action({ request }: ActionFunctionArgs) {
   const { authenticator } = createAuthenticator();
   await authenticator.authenticate("TOTP", request, {
      // The `successRedirect` route will be used to verify the OTP code.
      // This could be the current pathname or any other route that renders the verification form.
      successRedirect: "/verify-totp",

      // The `failureRedirect` route will be used to render any possible error.
      // This could be the current pathname or any other route that renders the login form.
      failureRedirect: "/",
   });
}

export default function Login() {
   const { authError } = useLoaderData<typeof loader>();

   return (
      <PageLayout>
         {/* Login Form. */}
         <Typography variant="h3" as="h1" className="mb-2">
            Login
         </Typography>
         <Form method="POST" className="space-y-2">
            <HoneypotInputs />
            <FormItem name="email">
               <FormLabel>E-post</FormLabel>
               <FormControl
                  render={(props) => <Input {...props} type="email" placeholder="Skriv inn e-post..." required />}
               />
            </FormItem>
            <Button type="submit">Send kode</Button>
         </Form>

         {/* Login Errors Handling. */}
         <Typography className="text-red-500">{authError?.message}</Typography>
      </PageLayout>
   );
}
