import { useFetcher } from "@remix-run/react";
import { Image, Loader2 } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Typography } from "~/components/ui/typography";

type Props = {
   eventId: number;
};

export const UploadImages = ({ eventId }: Props) => {
   const fetcher = useFetcher();
   const isLoading = fetcher.state !== "idle";
   const action = `/event/${eventId}/images`;
   const method = "POST";
   const encType = "multipart/form-data";
   return (
      <>
         <Typography variant="h3" className="flex gap-2 items-center flex-wrap">
            <Image />
            Last opp bilder
         </Typography>
         <fetcher.Form action={action} method={method} className="flex gap-2 items-center flex-wrap" encType={encType}>
            <Input
               onChange={(e) => fetcher.submit(e.target.form, { method, encType, action })}
               className="w-fit"
               type="file"
               multiple
               name="image"
               accept="image/*"
               disabled={isLoading}
            />
            {isLoading ? (
               <Typography variant="largeText" className="flex gap-2 items-center">
                  <Loader2 className="text-primary size-8 animate-spin" /> Laster opp bilder...
               </Typography>
            ) : null}
         </fetcher.Form>
      </>
   );
};
