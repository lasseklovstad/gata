import { Bell } from "lucide-react";

import { usePushSubscriptionContext } from "../PushSubscriptionContext";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { FormControl, FormDescription, FormItem, FormLabel } from "../ui/form";
import { Switch } from "../ui/switch";

export const PushSubscription = () => {
   const { error, subscribe, subscription, unsubscribe } = usePushSubscriptionContext();

   return (
      <>
         <FormItem name="pushSubscription" className="border p-2 flex justify-between items-center rounded">
            <div>
               <FormLabel className="flex gap-2 items-center">
                  <Bell /> Push notifikasjoner
               </FormLabel>
               <FormDescription>
                  Få tilsendt push notifikasjoner på enheten ved feks. endringer i et arrangement du deltar på
               </FormDescription>
            </div>
            <FormControl
               render={(props) => (
                  <Switch
                     {...props}
                     checked={subscription !== null}
                     onCheckedChange={(checked) => {
                        if (checked) {
                           void subscribe();
                        } else {
                           void unsubscribe();
                        }
                     }}
                  />
               )}
            />
         </FormItem>
         {error ? (
            <Alert variant="warning">
               <AlertTitle>Kunne ikke skru på notifikasjoner</AlertTitle>
               <AlertDescription>
                  Det ser ut som du må resette instillinger for tillatelser for denne nettsiden. {error}
               </AlertDescription>
            </Alert>
         ) : null}
      </>
   );
};
