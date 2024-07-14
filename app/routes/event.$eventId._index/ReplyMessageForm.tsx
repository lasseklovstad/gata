import { useFetcher } from "@remix-run/react";
import { Send } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import type { action } from "./route";

type Props = {
   messageId: number;
};

export const ReplyMessageForm = ({ messageId }: Props) => {
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
            <Label htmlFor={id} className="sr-only">
               Ny kommentar
            </Label>
            <div className="flex gap-2 w-full">
               <Input autoComplete="off" name="reply" className="w-full" id={id} placeholder="Legg til en kommentar" />
               <input hidden readOnly value={messageId} name="messageId" />
               <Button type="submit" variant="ghost" size="icon" name="intent" value="replyMessage">
                  <Send />
                  <span className="sr-only">Send melding</span>
               </Button>
            </div>
         </div>
      </fetcher.Form>
   );
};
