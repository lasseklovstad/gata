import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useState } from "react";

import type { CloudinaryImage } from "db/schema";
import { Button } from "~/components/ui/button";
import { LikeButton } from "~/routes/event.$eventId._index/LikeButton";
import { Likes } from "~/routes/event.$eventId._index/Likes";
import { cn } from "~/utils";
import { useDialog } from "~/utils/dialogUtils";
import { getIsVideo } from "~/utils/file.utils";

import { Typography } from "./ui/typography";

type Props = {
   cloudImage: CloudinaryImage & {
      likes: { type: string; userId: string; user: { name: string; picture: string } }[];
   };
   onNext: () => void;
   onPrevious: () => void;
   onClose: () => void;
   showNextAndPreviousButtons: boolean;
   eventId: number;
   loggedInUserId: string;
};

export const CloudImageFullscreen = ({
   cloudImage: { cloudUrl, width, height },
   cloudImage,
   onNext,
   onPrevious,
   onClose,
   showNextAndPreviousButtons,
   eventId,
   loggedInUserId,
}: Props) => {
   const dialog = useDialog({ defaultOpen: true });
   const [loadedCloudId, setLoadedCloudId] = useState<string | null>(null);
   const isLoaded = getIsVideo(cloudImage) || loadedCloudId === cloudImage.cloudId;

   return (
      <>
         <dialog
            ref={dialog.dialogRef}
            className="backdrop:bg-black/80 w-full h-screen flex justify-center items-center fixed top-0 left-0 m-0 p-0 max-w-full max-h-screen bg-black"
            onClose={onClose}
            onKeyDown={(e) => {
               if (e.key === "ArrowRight") {
                  onNext();
               }
               if (e.key === "ArrowLeft") {
                  onPrevious();
               }
            }}
         >
            <Button
               type="button"
               onClick={dialog.close}
               size="icon"
               variant="secondary"
               className="m-1 fixed right-0 top-0 z-50"
            >
               <X />
               <span className="sr-only">Lukk</span>
            </Button>
            {showNextAndPreviousButtons ? (
               <>
                  <Button
                     type="button"
                     onClick={onPrevious}
                     size="icon"
                     variant="link"
                     className="m-1 fixed left-0 bottom-[45%] z-50"
                  >
                     <ChevronLeft className="size-8" />
                     <span className="sr-only">Forrige bilde</span>
                  </Button>
                  <Button
                     type="button"
                     onClick={onNext}
                     size="icon"
                     variant="link"
                     className="m-1 fixed bottom-[45%] right-0 z-50"
                  >
                     <ChevronRight className="size-8" />
                     <span className="sr-only">Neste bilde</span>
                  </Button>
               </>
            ) : null}
            <Typography
               variant="h2"
               as="div"
               className={cn("z-50 fixed text-primary flex gap-2 items-center bottom-[45%]", isLoaded && "hidden")}
            >
               <Loader2 className="animate-spin size-12" />
            </Typography>
            {getIsVideo(cloudImage) ? (
               <video
                  className={cn("max-h-screen object-contain max-w-full", isLoaded ? "opacity-100" : "opacity-30")}
                  controls
                  style={{ width, height }}
                  loop
                  preload="metadata"
                  playsInline
               >
                  <source src={cloudUrl + "#t=0.001"} type="video/mp4"></source>
                  <track default kind="captions" />
               </video>
            ) : (
               <img
                  loading="eager"
                  className={cn("max-h-screen object-contain", isLoaded ? "opacity-100" : "opacity-30")}
                  fetchPriority="high"
                  src={cloudUrl}
                  alt=""
                  width={width}
                  height={height}
                  onLoad={() => setLoadedCloudId(cloudImage.cloudId)}
               />
            )}
            <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/40 px-4 py-2 text-white flex flex-col items-center gap-2">
               <Likes likes={cloudImage.likes} size="normal" />
               <LikeButton
                  targetId={cloudImage.cloudId}
                  targetIdKey="cloudId"
                  intent="likeImage"
                  actionPath={`/event/${eventId}`}
                  loggedInUserId={loggedInUserId}
                  likes={cloudImage.likes}
                  size="normal"
                  inline
                  className="[&_button]:bg-white/90 [&_button]:text-black"
               />
            </div>
         </dialog>
      </>
   );
};
