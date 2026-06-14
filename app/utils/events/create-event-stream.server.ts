import { eventStream } from "remix-utils/sse/server";

import { emitter } from "./emitter.server";

export function createEventStream(request: Request, eventName: string) {
   return eventStream(request.signal, (send) => {
      // Per-connection counter. Date.now() collides when two events fire within the
      // same millisecond, producing an identical payload — useEventSource then sees
      // no change and skips revalidation, so rapid successive updates get dropped.
      let id = 0;
      const handle = () => {
         try {
            send({
               data: String(id++),
            });
         } catch {
            // The client disconnected and its underlying stream controller was torn
            // down before our abort-triggered cleanup removed this listener, so
            // `send` -> `controller.enqueue` throws. `emitter.emit` runs listeners
            // synchronously, so without this guard the error propagates into whatever
            // called emit (e.g. the likeMessage action) and 500s an otherwise
            // successful request. Drop the dead listener so it can't keep failing.
            emitter.removeListener(eventName, handle);
         }
      };

      emitter.addListener(eventName, handle);

      return () => {
         emitter.removeListener(eventName, handle);
      };
   });
}
