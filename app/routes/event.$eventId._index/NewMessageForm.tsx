import { useFetcher } from "@remix-run/react";
import { Send } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

import type { action } from "./route";

export const NewMessageForm = () => {
   const fetcher = useFetcher<typeof action>();
   const formRef = useRef<HTMLFormElement>(null);
   const id = useId();

   useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data?.ok) {
         formRef.current?.reset();
      }
   }, [fetcher]);

   return (
      <fetcher.Form className="w-full" method="POST" ref={formRef}>
         <div className="flex flex-col gap-2 w-full">
            <Label htmlFor={id}>Nytt innlegg</Label>
            <div className="flex gap-2 w-full">
               <Textarea autoComplete="off" name="message" className="w-full" id={id} placeholder="Skriv noe..." />
               <Button type="submit" size="icon" name="intent" value="createMessage">
                  <Send />
                  <span className="sr-only">Opprett innlegg</span>
               </Button>
            </div>
         </div>
      </fetcher.Form>
   );
};
