import type { FormProps } from "@remix-run/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { Typography } from "./ui/typography";
import { Button } from "./ui/button";
import { useEffect, useRef } from "react";
import { Dialog, DialogFooter, DialogHeading } from "./ui/dialog";
import { useDialog } from "~/utils/dialogUtils";

type RouteConfirmFormDialogProps = {
   title?: string;
   text: string;
   backTo: string;
} & Pick<FormProps, "method" | "action">;

export const RouteConfirmFormDialog = ({
   text,
   backTo,
   title = "Er du sikker?",
   method,
   action,
}: RouteConfirmFormDialogProps) => {
   const { dialogRef } = useDialog({ defaultOpen: true });
   const navigate = useNavigate();
   const fetcher = useFetcher();
   const onClose = () => navigate(backTo);

   return (
      <Dialog ref={dialogRef} onClose={onClose}>
         <fetcher.Form method={method} action={action} preventScrollReset>
            <DialogHeading>{title}</DialogHeading>
            <div>{text}</div>
            <DialogFooter>
               <Button type="submit" isLoading={fetcher.state !== "idle"}>
                  Jeg er sikker
               </Button>
               <Button onClick={onClose} variant="ghost">
                  Avbryt
               </Button>
            </DialogFooter>
         </fetcher.Form>
      </Dialog>
   );
};
