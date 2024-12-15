import { Navigate } from "react-router";
import { z } from "zod";

import { getEvent } from "~/.server/db/gataEvent";
import { badRequest } from "~/utils/responseUtils";

import type { Route } from "./+types/route";

const paramSchema = z.object({
   eventId: z.coerce.number(),
});

export const meta = ({ data }: Route.MetaArgs) => {
   return [{ title: `Gata - ${data.event.title}` }];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;
   return { event: await getEvent(eventId) };
};

export default function PublicEvent({ loaderData: { event } }: Route.ComponentProps) {
   return <Navigate to={`/event/${event.id}`} />;
}
