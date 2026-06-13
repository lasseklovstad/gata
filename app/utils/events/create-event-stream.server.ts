import { eventStream } from "remix-utils/sse/server";

import { emitter } from "./emitter.server";

export function createEventStream(request: Request, eventName: string) {
   return eventStream(request.signal, (send) => {
      // Per-connection counter. Date.now() collides when two events fire within the
      // same millisecond, producing an identical payload — useEventSource then sees
      // no change and skips revalidation, so rapid successive updates get dropped.
      let id = 0;
      const handle = () => {
         send({
            data: String(id++),
         });
      };

      emitter.addListener(eventName, handle);

      return () => {
         emitter.removeListener(eventName, handle);
      };
   });
}
