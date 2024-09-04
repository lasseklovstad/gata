import { unstable_defineLoader as defineLoader, type MetaFunction } from "@remix-run/node";
import { Navigate, useLoaderData } from "@remix-run/react";
import { z } from "zod";

import { getEvent } from "~/.server/db/gataEvent";
import { badRequest } from "~/utils/responseUtils";

const paramSchema = z.object({
   eventId: z.coerce.number(),
});

export const meta: MetaFunction<typeof loader> = ({ data }) => {
   return [{ title: `Gata - ${data?.event.title}` }];
};

export const loader = defineLoader(async ({ params }) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;
   return { event: await getEvent(eventId) };
});

export default function PublicEvent() {
   const { event } = useLoaderData<typeof loader>();
   return <Navigate to={`/event/${event.id}`} />;
}
