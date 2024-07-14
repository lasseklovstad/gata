import { useFetcher } from "@remix-run/react";
import { Send } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "~/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import type { action } from "./route";

type Props = {
   messageId: number;
};

export const ReplyMessageForm = ({ messageId }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const formRef = useRef<HTMLFormElement>(null);

   useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data?.ok) {
         formRef.current?.reset();
      }
   }, [fetcher]);

   return (
      <fetcher.Form className="w-full" method="POST" ref={formRef}>
         <FormProvider
            errors={fetcher.data?.ok === false ? fetcher.data.errors : undefined}
            className="flex flex-col gap-2 w-full"
         >
            <FormItem name="reply">
               <FormLabel className="sr-only">Ny kommentar</FormLabel>
               <div className="flex gap-2 w-full">
                  <FormControl
                     render={(props) => (
                        <Input {...props} autoComplete="off" className="w-full" placeholder="Legg til en kommentar" />
                     )}
                  />
                  <input hidden readOnly value={messageId} name="messageId" />
                  <Button type="submit" variant="ghost" size="icon" name="intent" value="replyMessage">
                     <Send />
                     <span className="sr-only">Kommenter</span>
                  </Button>
               </div>
               <FormMessage />
            </FormItem>
         </FormProvider>
      </fetcher.Form>
   );
};
