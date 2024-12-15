import { createEventStream } from "~/utils/events/create-event-stream.server";

import type { Route } from "./+types/route";

export const loader = ({ request, params }: Route.LoaderArgs) => {
   return createEventStream(request, `event-${params.eventId}-activities`);
};
