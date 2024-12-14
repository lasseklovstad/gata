import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "~/components/ui/form";

import type { action } from "./route";
import { TextareaWithAutocomplete } from "./TextareaWithAutocomplete";

type User = { id: string; name: string; picture: string };

type Props = {
   messageId: number;
   usersWithSubscription: User[];
};

export const ReplyMessageForm = ({ messageId, usersWithSubscription }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const [value, setValue] = useState("");

   useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data?.ok) {
         setValue("");
      }
   }, [fetcher]);

   return (
      <fetcher.Form className="w-full" method="POST">
         <FormProvider
            errors={fetcher.data?.ok === false ? fetcher.data.errors : undefined}
            className="flex flex-col gap-2 w-full"
         >
            <FormItem name="reply">
               <FormLabel className="sr-only">Ny kommentar</FormLabel>
               <div className="flex gap-2 w-full">
                  <FormControl
                     render={(props) => (
                        <TextareaWithAutocomplete
                           inputProps={{
                              ...props,
                              placeholder: "Legg til en kommentar. Tag folk med @",
                              rows: 2,
                              className: "min-h-2",
                           }}
                           setValue={setValue}
                           value={value}
                           usersWithSubscription={usersWithSubscription}
                        />
                     )}
                  />
                  <input hidden readOnly value={messageId} name="messageId" />
                  <Button
                     type="submit"
                     variant="ghost"
                     size="icon"
                     name="intent"
                     value="replyMessage"
                     isLoading={fetcher.state !== "idle"}
                  >
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
