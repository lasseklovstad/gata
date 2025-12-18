import { useRef, useState } from "react";
import Map, { Marker } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

import type { User } from "~/.server/db/user";
import type { TimeLineEvent } from "~/.server/db/userTimelineEvent";
import { AvatarUser } from "~/components/AvatarUser";
import { Button } from "~/components/ui/button";
import { Dialog, DialogCloseButton, DialogHeading } from "~/components/ui/dialog";
import { Typography } from "~/components/ui/typography";

type Props = {
   timelineEvents: TimeLineEvent[];
   users: User[];
};

export const TimeLineMap = ({ timelineEvents, users }: Props) => {
   const [currentTimeIndex, setCurrentTimeIndex] = useState<number>(0);
   const [selectedMarkerUserId, setSelectedMarkerUserId] = useState<string | null>(null);
   const dialogRef = useRef<HTMLDialogElement>(null);

   // Extract unique dates and sort chronologically
   const uniqueDates = Array.from(new Set(timelineEvents.map((event) => event.eventDate))).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
   );

   // Get current selected date
   const currentDate = uniqueDates[currentTimeIndex] || uniqueDates[0];

   // Filter events by selected user and current time (up to and including current date)
   const timeFilteredEvents = timelineEvents.filter(
      (event) => new Date(event.eventDate).getTime() <= new Date(currentDate).getTime()
   );

   // Get home events with coordinates for map markers
   const homeEventsForMap = timeFilteredEvents.filter(
      (event) => event.eventType === "home" && event.longitude != null && event.latitude != null
   );

   // Group by user (get latest home event per user)
   type HomeEvent = (typeof homeEventsForMap)[0];
   const latestHomeByUserMap: Partial<Record<string, HomeEvent>> = {};
   homeEventsForMap.forEach((event) => {
      const existing = latestHomeByUserMap[event.userId];
      if (!existing || new Date(event.eventDate) > new Date(existing.eventDate)) {
         latestHomeByUserMap[event.userId] = event;
      }
   });
   const latestHomeByUser = Object.values(latestHomeByUserMap) as HomeEvent[];

   // Get events for selected marker dialog
   // Only show the latest event of each type for the selected user up to current date
   const selectedUserEvents = selectedMarkerUserId
      ? (() => {
           const userEvents = timeFilteredEvents.filter((event) => event.userId === selectedMarkerUserId);

           // Group by eventType and get the latest event for each type
           const latestByType: Partial<Record<string, TimeLineEvent>> = {};
           userEvents.forEach((event) => {
              const existing = latestByType[event.eventType];
              if (!existing || new Date(event.eventDate) > new Date(existing.eventDate)) {
                 latestByType[event.eventType] = event;
              }
           });

           // Return as array sorted by date (most recent first)
           return Object.values(latestByType)
              .filter((event): event is TimeLineEvent => event !== undefined)
              .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
        })()
      : [];

   const selectedUser = selectedMarkerUserId ? users.find((u) => u.id === selectedMarkerUserId) : null;

   // Event type labels
   const eventTypeLabels: Record<string, string> = {
      "civil-status": "Sivilstatus",
      home: "Bosted",
      work: "Arbeid",
   };

   // Handle previous/next timeline navigation
   const handlePrevious = () => {
      if (currentTimeIndex > 0) {
         setCurrentTimeIndex(currentTimeIndex - 1);
      }
   };

   const handleNext = () => {
      if (currentTimeIndex < uniqueDates.length - 1) {
         setCurrentTimeIndex(currentTimeIndex + 1);
      }
   };

   // Handle marker click
   const handleMarkerClick = (userId: string) => {
      setSelectedMarkerUserId(userId);
      dialogRef.current?.showModal();
   };

   // Handle close dialog
   const handleCloseDialog = () => {
      dialogRef.current?.close();
      setSelectedMarkerUserId(null);
   };
   return (
      <div>
         {/* Timeline Slider */}
         {uniqueDates.length > 0 && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/50">
               <div className="flex items-center gap-4 mb-3">
                  <Button onClick={handlePrevious} disabled={currentTimeIndex === 0} variant="outline" size="sm">
                     ← Forrige
                  </Button>
                  <div className="flex-1 text-center">
                     <Typography variant="h4" className="mb-1">
                        {new Date(currentDate).toLocaleDateString("nb-NO", {
                           year: "numeric",
                           month: "long",
                           day: "numeric",
                        })}
                     </Typography>
                     <Typography variant="smallText" className="text-muted-foreground">
                        {currentTimeIndex + 1} av {uniqueDates.length}
                     </Typography>
                  </div>
                  <Button
                     onClick={handleNext}
                     disabled={currentTimeIndex === uniqueDates.length - 1}
                     variant="outline"
                     size="sm"
                  >
                     Neste →
                  </Button>
               </div>
               <div className="flex items-center gap-3">
                  <Typography variant="smallText" className="text-muted-foreground flex-shrink-0">
                     {new Date(uniqueDates[0]).toLocaleDateString("nb-NO", {
                        year: "numeric",
                        month: "short",
                     })}
                  </Typography>
                  <input
                     type="range"
                     min="0"
                     max={uniqueDates.length - 1}
                     value={currentTimeIndex}
                     onChange={(e) => setCurrentTimeIndex(Number(e.target.value))}
                     className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                     style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentTimeIndex / (uniqueDates.length - 1)) * 100}%, rgb(229 231 235) ${(currentTimeIndex / (uniqueDates.length - 1)) * 100}%, rgb(229 231 235) 100%)`,
                     }}
                  />
                  <Typography variant="smallText" className="text-muted-foreground flex-shrink-0">
                     {new Date(uniqueDates[uniqueDates.length - 1]).toLocaleDateString("nb-NO", {
                        year: "numeric",
                        month: "short",
                     })}
                  </Typography>
               </div>
            </div>
         )}

         {/* Map with Markers */}
         <Map
            initialViewState={{
               longitude: 10.7461,
               latitude: 59.9127,
               zoom: 5,
            }}
            style={{ width: "100%", height: "600px" }}
            mapStyle="https://api.maptiler.com/maps/base-v4/style.json?key=lLMSHC7KCVK6NsfkNcUu"
         >
            {latestHomeByUser.map((event) => {
               const user = users.find((u) => u.id === event.userId);
               if (!user || event.longitude == null || event.latitude == null) return null;

               return (
                  <Marker key={event.id} longitude={event.longitude} latitude={event.latitude} anchor="center">
                     <button
                        onClick={() => handleMarkerClick(event.userId)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                        aria-label={`Se tidslinje for ${user.name}`}
                     >
                        <AvatarUser user={user} className="w-10 h-10 border-2 border-white shadow-lg" />
                     </button>
                  </Marker>
               );
            })}
         </Map>
         {/* User Timeline Dialog */}
         <Dialog ref={dialogRef} className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogCloseButton onClose={handleCloseDialog} />
            <DialogHeading>Status for {selectedUser?.name}</DialogHeading>
            <Typography>
               Dato:{" "}
               {new Date(currentDate).toLocaleDateString("nb-NO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
               })}
            </Typography>
            <div className="grid gap-4 mt-4">
               {selectedUserEvents.length === 0 ? (
                  <Typography variant="mutedText" className="text-center py-8">
                     Ingen hendelser registrert
                  </Typography>
               ) : (
                  selectedUserEvents.map((event) => (
                     <div key={event.id} className="border rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <Typography variant="h4">{eventTypeLabels[event.eventType]}</Typography>
                           {event.isVerified ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verifisert</span>
                           ) : (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Ikke Verifisert</span>
                           )}
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
                        </div>
                     </div>
                  ))
               )}
            </div>
         </Dialog>
      </div>
   );
};
