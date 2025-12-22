import { Pencil } from "lucide-react";
import { useState } from "react";
import { Form, useNavigation } from "react-router";

import type { User } from "~/.server/db/user";
import type { TimeLineEvent } from "~/.server/db/userTimelineEvent";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { NativeSelect } from "~/components/ui/native-select";
import { Typography } from "~/components/ui/typography";
import { cn } from "~/utils";
import { useDialog } from "~/utils/dialogUtils";
import { getIsTimelineAdmin } from "~/utils/roleUtils";

import { EventForm } from "./EventForm";

// Event type labels
const eventTypeLabels: Record<string, string> = {
   "civil-status": "Sivilstatus",
   home: "Bosted",
   work: "Arbeid",
};

// Event type colors
const eventTypeColors: Record<string, string> = {
   "civil-status": "bg-blue-100 text-blue-800",
   home: "bg-green-100 text-green-800",
   work: "bg-orange-100 text-orange-800",
};

type TimelineTableProps = {
   timelineEvents: TimeLineEvent[];
   users: User[];
   loggedInUser: User;
};

export function TimelineTable({ loggedInUser, users, timelineEvents }: TimelineTableProps) {
   const [selectedUserId, setSelectedUserId] = useState<string>("");
   const [editingEvent, setEditingEvent] = useState<TimeLineEvent | null>(null);
   const editDialog = useDialog({ defaultOpen: false });
   const navigation = useNavigation();
   const isTimelineAdmin = getIsTimelineAdmin(loggedInUser);

   const handleEdit = (event: TimeLineEvent) => {
      setEditingEvent(event);
      editDialog.open();
   };

   const handleEditSuccess = () => {
      editDialog.close();
      setEditingEvent(null);
   };

   const handleEditClose = () => {
      editDialog.close();
      setEditingEvent(null);
   };

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
         <NativeSelect
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-fit min-w-60 mb-4"
         >
            <option value="">Alle medlemmer</option>
            {sortedUsers.map((user) => (
               <option key={user.id} value={user.id}>
                  {user.name}
               </option>
            ))}
         </NativeSelect>

         {sortedEvents.length === 0 ? (
            <div className="text-center py-8">
               <Typography variant="mutedText">Ingen hendelser registrert ennå</Typography>
            </div>
         ) : (
            <div className="overflow-x-auto rounded-lg border">
               <table className="w-full">
                  <thead className="bg-primary/10">
                     <tr>
                        <th scope="col" className="p-3 text-left font-semibold">
                           Dato
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                           Person
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                           Type
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                           Sted
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                           Beskrivelse
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                           Status
                        </th>
                        <th scope="col" className="p-3 text-left font-semibold">
                           Handlinger
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y">
                     {sortedEvents.map((event) => {
                        const user = users.find((u) => u.id === event.userId);
                        const canDelete = event.createdBy === loggedInUser.id || isTimelineAdmin;
                        const canEdit = event.createdBy === loggedInUser.id || isTimelineAdmin;
                        if (!user) {
                           throw new Error("Could not find user!");
                        }
                        return (
                           <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-3 whitespace-nowrap">
                                 {new Date(event.eventDate).toLocaleDateString("nb-NO", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                 })}
                              </td>
                              <td className="p-3">{user.name}</td>
                              <td className="p-3">
                                 <span
                                    className={cn(
                                       "text-xs px-2 py-1 rounded font-medium",
                                       eventTypeColors[event.eventType]
                                    )}
                                 >
                                    {eventTypeLabels[event.eventType]}
                                 </span>
                              </td>
                              <td className="p-3">{event.place || "-"}</td>
                              <td className="p-3 max-w-[50px]">
                                 <div className="truncate" title={event.description}>
                                    {event.description || "-"}
                                 </div>
                              </td>
                              <td className="p-3">
                                 {event.isVerified ? (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                                       Verifisert
                                    </span>
                                 ) : (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                                       Ikke Verifisert
                                    </span>
                                 )}
                              </td>
                              <td className="p-3">
                                 <div className="flex gap-2 flex-wrap">
                                    {isTimelineAdmin && (
                                       <Form method="post">
                                          <input type="hidden" name="intent" value="toggleVerify" />
                                          <input type="hidden" name="eventId" value={event.id} />
                                          <input
                                             type="hidden"
                                             name="isVerified"
                                             value={(!event.isVerified).toString()}
                                          />
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
                                    {canEdit && (
                                       <Button variant="secondary" size="sm" onClick={() => handleEdit(event)}>
                                          <Pencil className="size-4 mr-1" />
                                          Rediger
                                       </Button>
                                    )}
                                    {canDelete && (
                                       <Form method="delete">
                                          <input type="hidden" name="intent" value="deleteTimelineEvent" />
                                          <input type="hidden" name="eventId" value={event.id} />
                                          <Button type="submit" variant="destructive" size="sm">
                                             Slett
                                          </Button>
                                       </Form>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         )}

         <Dialog ref={editDialog.dialogRef} className="max-w-4xl">
            {editingEvent && (
               <EventForm users={users} event={editingEvent} onSuccess={handleEditSuccess} onClose={handleEditClose} />
            )}
         </Dialog>
      </div>
   );
}
