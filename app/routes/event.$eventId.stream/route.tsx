import type { LoaderFunctionArgs } from "@remix-run/node";

import { createEventStream } from "~/utils/events/create-event-stream.server";

export function loader({ request, params }: LoaderFunctionArgs) {
   return createEventStream(request, `event-${params.eventId!}-activities`);
}
