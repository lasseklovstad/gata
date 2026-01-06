import { useState } from "react";
import { Form, Link } from "react-router";

import { Button } from "~/components/ui/button";

import type { Route } from "./+types/sentry-test";

export const loader = ({ request }: Route.LoaderArgs) => {
   const search = new URL(request.url).searchParams;
   if (search.get("error") === "true") {
      throw new Error("Error in loader...");
   }
   return {};
};

export const action = () => {
   throw new Error("Error in action...");
};

export default function SentryTest() {
   const [throwError, setThrowError] = useState(false);
   if (throwError) {
      throw new Error("Error in client...");
   }
   return (
      <main className="p-8">
         <Button
            onClick={() => {
               setThrowError(true);
            }}
         >
            Trigger error on client
         </Button>
         <Button as={Link} variant="link" to={{ search: "?error=true" }}>
            Navigate to error in loader
         </Button>
         <Form method="POST">
            <Button variant="outline" type="submit">
               Trigger error in action
            </Button>
         </Form>
      </main>
   );
}
