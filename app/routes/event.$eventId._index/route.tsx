import { type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Vote } from "lucide-react";
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

   return (
      <div className="space-y-4">
         <Typography variant="h3" className="mb-2">
            Aktive avstemninger
         </Typography>
         <ul className="space-y-2 max-w-fit">
            {polls
               .filter((p) => p.poll.isActive)
               .map(({ poll }) => {
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
         <UploadImages eventId={eventId} />
         <CloudImageGallery cloudImages={cloudinaryImages.slice(0, 10)} />
         {cloudinaryImages.length ? (
            <Button variant="outline" as={Link} to="images">
               Se alle bilder
            </Button>
         ) : null}
      </div>
   );
}
