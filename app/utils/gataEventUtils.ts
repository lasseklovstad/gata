import type { GataEvent } from "~/.server/db/gataEvent";
import type { User } from "~/.server/db/user";

import { isAdmin } from "./roleUtils";

export const isUserOrganizer = (event: GataEvent, user: User) => {
   return !!event.organizers.find((organizer) => organizer.userId === user.id) || isAdmin(user);
};
