import { useFetcher } from "@remix-run/react";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Label } from "~/components/ui/label";

type Props = {
   isActive: boolean;
   isOrganizer: boolean;
   pollId: number;
};

export const PollActiveStatus = ({ isActive, isOrganizer, pollId }: Props) => {
   const fetcher = useFetcher();
   return (
      <>
         {isOrganizer ? (
            <Label className="cursor-pointer text-xl flex items-center my-2 gap-2">
               <input
                  onChange={() => {
                     fetcher.submit({ intent: "toggleActive", pollId }, { method: "PUT" });
                  }}
                  defaultChecked={!isActive}
                  className="cursor-pointer size-4"
                  type="checkbox"
               />
               Avslutt avstemning
            </Label>
         ) : !isActive ? (
            <Alert className="my-2" variant="warning">
               <AlertTitle>Avstemningen er avsluttet</AlertTitle>
            </Alert>
         ) : null}
      </>
   );
};
