import type { LoaderFunctionArgs } from "react-router";

import { createEventStream } from "~/utils/events/create-event-stream.server";

export const loader = ({ request, params }: LoaderFunctionArgs) => {
   return createEventStream(request, `event-${params.eventId!}-activities`);
};
