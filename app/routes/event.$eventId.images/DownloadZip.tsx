import { useFetcher } from "@remix-run/react";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";
import { Download } from "lucide-react";

import type { GataEvent } from "~/.server/db/gataEvent";
import { Button } from "~/components/ui/button";
import { DialogHeading, DialogCloseButton, DialogFooter, Dialog } from "~/components/ui/dialog";
import { Typography } from "~/components/ui/typography";
import { useDialog } from "~/utils/dialogUtils";

import type { action } from "./route";

type Props = {
   event: GataEvent;
};

export const DownloadZip = ({ event }: Props) => {
   const zipDialog = useDialog({ defaultOpen: false });

   const fetcherZip = useFetcher<typeof action>();

   const zipUrl = fetcherZip.data ? fetcherZip.data.zipUrl : event.zipUrl;
   const timestampString = zipUrl ? new URL(zipUrl).searchParams.get("timestamp") : undefined;
   const timestamp = timestampString ? parseInt(timestampString) * 1000 : undefined;
   const timestampNow = new Date().valueOf();
   // Link invalidates after one hour
   const linkInvalid = timestamp ? timestamp + 1000 * 60 * 60 > timestampNow : false;

   return (
      <div>
         <Button className="hidden md:flex" variant="outline" onClick={zipDialog.open}>
            <Download className="mr-2" />
            Last ned som zip
         </Button>
         <Dialog ref={zipDialog.dialogRef}>
            <DialogHeading>Last ned som zip</DialogHeading>
            <DialogCloseButton onClose={zipDialog.close} />
            {zipUrl ? (
               <div className="flex flex-col gap-2 items-start">
                  Link utgår: {formatDate(new Date(timestamp! + 1000 * 60 * 60), "PPPP HH:mm", { locale: nb })}
                  <Button as="a" variant="outline" href={zipUrl} target="_blank">
                     Last ned zip
                  </Button>
               </div>
            ) : (
               "Ingen url'er generert enda. Trykk på knappen under for å lage zip."
            )}
            <Typography>Ikke generer zip for moro skyld. Gjør det hvis du skal arkivere bildene for Gata.</Typography>
            <DialogFooter>
               <fetcherZip.Form method="POST">
                  <Button
                     disabled={linkInvalid}
                     type="submit"
                     name="intent"
                     value="generateZipUrl"
                     isLoading={fetcherZip.state === "loading"}
                  >
                     Generer zip
                  </Button>
               </fetcherZip.Form>
            </DialogFooter>
         </Dialog>
      </div>
   );
};
