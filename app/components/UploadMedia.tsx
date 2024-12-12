import { Loader2 } from "lucide-react";
import { useFetcher } from "react-router";

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
         {/* Important with max-w-full for iphone not extending out of screen */}
         <fetcher.Form
            action={actionPath}
            method={method}
            className="flex gap-2 items-center flex-wrap max-w-full"
            encType={encType}
         >
            <Input
               onChange={(e) => void fetcher.submit(e.target.form, { method, encType, action: actionPath })}
               className="w-fit"
               type="file"
               multiple
               name="cloudinary-file"
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
