import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Navigate, useLoaderData } from "react-router";
import { z } from "zod";

import { getEvent } from "~/.server/db/gataEvent";
import { badRequest } from "~/utils/responseUtils";

const paramSchema = z.object({
   eventId: z.coerce.number(),
});

export const meta: MetaFunction<typeof loader> = ({ data }) => {
   return [{ title: `Gata - ${data?.event.title}` }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
   const paramsParsed = paramSchema.safeParse(params);
   if (!paramsParsed.success) {
      throw badRequest(paramsParsed.error.message);
   }
   const { eventId } = paramsParsed.data;
   return { event: await getEvent(eventId) };
};

export default function PublicEvent() {
   const { event } = useLoaderData<typeof loader>();
   return <Navigate to={`/event/${event.id}`} />;
}
