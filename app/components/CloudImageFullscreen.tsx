import { Image } from "@unpic/react";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { CloudinaryImage } from "db/schema";
import { Button } from "~/components/ui/button";
import { cn } from "~/utils";
import { getIsVideo } from "~/utils/cloudinaryUtils";
import { useDialog } from "~/utils/dialogUtils";

import { Typography } from "./ui/typography";

type Props = {
   cloudImage: CloudinaryImage;
   onNext: () => void;
   onPrevious: () => void;
   onClose: () => void;
   showNextAndPreviousButtons: boolean;
};

export const CloudImageFullscreen = ({
   cloudImage: { cloudUrl, width, height },
   onNext,
   onPrevious,
   onClose,
   showNextAndPreviousButtons,
}: Props) => {
   const dialog = useDialog({ defaultOpen: true });
   const [isLoaded, setIsLoaded] = useState(false);

   useEffect(() => {
      setIsLoaded(false);
   }, [cloudUrl]);

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
            {getIsVideo(cloudUrl) ? (
               <video
                  className={cn("max-h-screen object-contain max-w-full", isLoaded ? "opacity-100" : "opacity-30")}
                  onCanPlay={() => setIsLoaded(true)}
                  controls
                  style={{ width, height }}
                  src={cloudUrl}
               >
                  <track default kind="captions" />
               </video>
            ) : (
               <Image
                  loading="eager"
                  unstyled
                  className={cn("max-h-screen object-contain", isLoaded ? "opacity-100" : "opacity-30")}
                  fetchPriority="high"
                  src={cloudUrl}
                  background="auto"
                  alt=""
                  width={width}
                  height={height}
                  onLoad={() => setIsLoaded(true)}
               />
            )}
         </dialog>
      </>
   );
};
