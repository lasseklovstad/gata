import { useFetcher } from "@remix-run/react";
import { Image, Loader2 } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Typography } from "~/components/ui/typography";
import type { action } from "~/routes/event.$eventId.images/route";

type Props = {
   eventId: number;
};

export const UploadMedia = ({ eventId }: Props) => {
   const fetcher = useFetcher<typeof action>();
   const isLoading = fetcher.state !== "idle";
   const actionPath = `/event/${eventId}/images`;
   const method = "POST";
   const encType = "multipart/form-data";
   return (
      <>
         <Typography variant="h3" className="flex gap-2 items-center flex-wrap">
            <Image />
            Last opp bilder og video
         </Typography>
         {/* Important with max-w-full for iphone not extending out of screen */}
         <fetcher.Form
            action={actionPath}
            method={method}
            className="flex gap-2 items-center flex-wrap max-w-full"
            encType={encType}
         >
            <Input
               onChange={(e) => fetcher.submit(e.target.form, { method, encType, action: actionPath })}
               className="w-fit"
               type="file"
               multiple
               name="image"
               accept="image/*,video/*"
               disabled={isLoading}
            />
            {isLoading ? (
               <Typography variant="largeText" className="flex gap-2 items-center">
                  <Loader2 className="text-primary size-8 animate-spin" /> Laster opp bilder/video...
               </Typography>
            ) : null}
         </fetcher.Form>
      </>
   );
};
