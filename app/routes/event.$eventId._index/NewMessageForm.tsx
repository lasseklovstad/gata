import { useFetcher } from "@remix-run/react";
import { Send } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "~/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";

import type { action } from "./route";

export const NewMessageForm = () => {
   const fetcher = useFetcher<typeof action>();
   const formRef = useRef<HTMLFormElement>(null);

   useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data?.ok) {
         formRef.current?.reset();
      }
   }, [fetcher]);

   return (
      <fetcher.Form className="w-full space-y-2" method="POST" ref={formRef}>
         <FormProvider errors={fetcher.data?.ok === false ? fetcher.data.errors : undefined}>
            <FormItem name="message">
               <FormLabel>Nytt innlegg</FormLabel>
               <FormControl
                  render={(props) => (
                     <Textarea
                        {...props}
                        autoComplete="off"
                        name="message"
                        className="w-full"
                        placeholder="Skriv noe..."
                     />
                  )}
               />
               <FormMessage />
            </FormItem>
         </FormProvider>
         <Button type="submit" name="intent" value="createMessage" variant="outline">
            <span>Publiser innlegg</span>
            <Send className="ml-2" />
         </Button>
      </fetcher.Form>
   );
};
