import { type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Vote } from "lucide-react";
import { useId } from "react";
import { z } from "zod";

import { getEventCloudinaryImages, getEventPollsSimple } from "~/.server/db/gataEvent";
import { CloudImageGallery } from "~/components/CloudImageGallery";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";
import { createAuthenticator } from "~/utils/auth.server";
import { badRequest } from "~/utils/responseUtils";

import { UploadImages } from "../../components/UploadImages";

const paramSchema = z.object({
   eventId: z.coerce.number(),
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;
   await createAuthenticator().getRequiredUser(request);
   const [polls, cloudinaryImages] = await Promise.all([
      getEventPollsSimple(eventId),
      getEventCloudinaryImages(eventId),
   ]);
   return { polls, cloudinaryImages, eventId };
};

export default function EventActivities() {
   const { polls, cloudinaryImages, eventId } = useLoaderData<typeof loader>();
   const activePollsTitleId = useId();
   const activePolls = polls.filter((p) => p.poll.isActive);
   return (
      <div className="flex flex-col gap-4 items-start">
         {activePolls.length > 0 ? (
            <>
               <Typography variant="h3" className="mb-2" id={activePollsTitleId}>
                  Aktive avstemninger
               </Typography>
               <ul className="flex gap-2 flex-wrap" aria-labelledby={activePollsTitleId}>
                  {activePolls.map(({ poll }) => {
                     return (
                        <li key={poll.id} className="bg-orange-100 rounded py-2 px-4 shadow flex">
                           <Link to={`polls?pollId=${poll.id}`} className="w-full text-base flex">
                              <Vote className="mr-2" />
                              {poll.name}
                           </Link>
                        </li>
                     );
                  })}
               </ul>
            </>
         ) : null}
         <UploadImages eventId={eventId} />
         <CloudImageGallery cloudImages={cloudinaryImages.slice(0, 8)} />
         {cloudinaryImages.length ? (
            <Button variant="outline" as={Link} to="images">
               Se alle bilder
            </Button>
         ) : null}
      </div>
   );
}
