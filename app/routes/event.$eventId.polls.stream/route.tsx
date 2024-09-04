import { unstable_defineLoader as defineLoader } from "@remix-run/node";

import { createEventStream } from "~/utils/events/create-event-stream.server";

export const loader = defineLoader(({ request, params }) => {
   return createEventStream(request, `event-${params.eventId!}-polls`);
});
