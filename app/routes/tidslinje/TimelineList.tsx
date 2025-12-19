import { useState } from "react";
import { Form, useNavigation } from "react-router";

import type { User } from "~/.server/db/user";
import type { TimeLineEvent } from "~/.server/db/userTimelineEvent";
import { Button } from "~/components/ui/button";
import { NativeSelect } from "~/components/ui/native-select";
import { Typography } from "~/components/ui/typography";
import { getIsTimelineAdmin } from "~/utils/roleUtils";

type Props = {
   timelineEvents: TimeLineEvent[];
   users: User[];
   loggedInUser: User;
};

// Event type labels
const eventTypeLabels: Record<string, string> = {
   "civil-status": "Sivilstatus",
   home: "Bosted",
   work: "Arbeid",
};

export const TimelineList = ({ loggedInUser, users, timelineEvents }: Props) => {
   const [selectedUserId, setSelectedUserId] = useState<string>("");
   const navigation = useNavigation();
   const isTimelineAdmin = getIsTimelineAdmin(loggedInUser);

   const filteredEvents = selectedUserId
      ? timelineEvents.filter((event) => event.userId === selectedUserId)
      : timelineEvents;

   // Sort events by date, newest first
   const sortedEvents = [...filteredEvents].sort((a, b) => {
      return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
   });

   // Sort users alphabetically for dropdown
   const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));

   return (
      <div>
         <NativeSelect value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-fit">
            <option value="">Alle medlemmer</option>
            {sortedUsers.map((user) => (
               <option key={user.id} value={user.id}>
                  {user.name}
               </option>
            ))}
         </NativeSelect>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedEvents.length === 0 ? (
               <div className="col-span-full text-center py-8">
                  <Typography variant="mutedText">Ingen hendelser registrert ennå</Typography>
               </div>
            ) : (
               sortedEvents.map((event) => {
                  const user = users.find((u) => u.id === event.userId);
                  if (!user) {
                     throw new Error("Could not find user!");
                  }
                  return (
                     <div key={event.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                           <Typography variant="h4">{eventTypeLabels[event.eventType]}</Typography>
                           <div className="flex items-center gap-2">
                              {event.isVerified ? (
                                 <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Verifisert
                                 </span>
                              ) : (
                                 <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                    Ikke Verifisert
                                 </span>
                              )}
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div>
                              <Typography variant="smallText" className="text-muted-foreground">
                                 Dato
                              </Typography>
                              <Typography variant="p">
                                 {new Date(event.eventDate).toLocaleDateString("nb-NO", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                 })}
                              </Typography>
                           </div>
                           <div>
                              <Typography variant="smallText" className="text-muted-foreground">
                                 Person
                              </Typography>
                              <Typography variant="p">{user.name}</Typography>
                           </div>
                           {event.place && (
                              <div>
                                 <Typography variant="smallText" className="text-muted-foreground">
                                    Sted
                                 </Typography>
                                 <Typography variant="p">{event.place}</Typography>
                              </div>
                           )}
                           {event.description && (
                              <div>
                                 <Typography variant="smallText" className="text-muted-foreground">
                                    Beskrivelse
                                 </Typography>
                                 <Typography variant="p">{event.description}</Typography>
                              </div>
                           )}
                           {isTimelineAdmin && (
                              <Form method="post">
                                 <input type="hidden" name="intent" value="toggleVerify" />
                                 <input type="hidden" name="eventId" value={event.id} />
                                 <input type="hidden" name="isVerified" value={(!event.isVerified).toString()} />
                                 <Button
                                    type="submit"
                                    disabled={
                                       navigation.state === "submitting" &&
                                       navigation.formData?.get("eventId") === event.id
                                    }
                                    variant={event.isVerified ? "secondary" : "default"}
                                    size="sm"
                                 >
                                    {event.isVerified ? "Fjern verifisering" : "Verifiser"}
                                 </Button>
                              </Form>
                           )}
                        </div>
                     </div>
                  );
               })
            )}
         </div>
      </div>
   );
};
