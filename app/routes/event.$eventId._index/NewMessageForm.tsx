import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage, FormProvider } from "~/components/ui/form";

import type { action } from "./route";
import { TextareaWithAutocomplete } from "./TextareaWithAutocomplete";

type User = { id: string; name: string; picture: string };

type Props = {
   usersWithSubscription: User[];
};

export const NewMessageForm = ({ usersWithSubscription }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const formRef = useRef<HTMLFormElement>(null);
   const [value, setValue] = useState("");

   useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data?.ok) {
         setValue("");
      }
   }, [fetcher]);

   return (
      <fetcher.Form className="w-full space-y-2" method="POST" ref={formRef}>
         <FormProvider errors={fetcher.data?.ok === false ? fetcher.data.errors : undefined}>
            <FormItem name="message">
               <FormLabel>Nytt innlegg</FormLabel>
               <FormControl
                  render={(props) => (
                     <TextareaWithAutocomplete
                        inputProps={{ ...props, placeholder: "Tag folk med @" }}
                        setValue={setValue}
                        value={value}
                        usersWithSubscription={usersWithSubscription}
                     />
                  )}
               />
               <FormMessage />
            </FormItem>
         </FormProvider>
         <Button
            type="submit"
            name="intent"
            value="createMessage"
            variant="outline"
            isLoading={fetcher.state !== "idle"}
         >
            <span>Publiser innlegg</span>
            <Send className="ml-2" />
         </Button>
      </fetcher.Form>
   );
};
