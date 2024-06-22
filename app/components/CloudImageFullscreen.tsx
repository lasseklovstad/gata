import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { buildImageUrl } from "~/utils/cloudinaryUtils";
import { useDialog } from "~/utils/dialogUtils";

import { Typography } from "./ui/typography";

type Props = {
   url: string;
   onNext: () => void;
   onPrevious: () => void;
   onClose: () => void;
};

export const CloudImageFullscreen = ({ url, onNext, onPrevious, onClose }: Props) => {
   const dialog = useDialog({ defaultOpen: true });

   return (
      <>
         <dialog
            ref={dialog.dialogRef}
            className="backdrop:bg-black/80 rounded fixed top-[50%] left-[50%] m-0 p-0 -translate-x-[50%] -translate-y-[50%] w-[90vw]"
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
            <div className="flex justify-center bg-black min-w-[200px] min-h-[200px]">
               <Button
                  type="button"
                  onClick={dialog.close}
                  size="icon"
                  variant="secondary"
                  className="m-2 absolute right-0 z-50"
               >
                  <X />
                  <span className="sr-only">Lukk</span>
               </Button>
               <Button
                  type="button"
                  onClick={onPrevious}
                  size="icon"
                  variant="secondary"
                  className="m-2 absolute left-0 top-[50%] z-50"
               >
                  <ChevronLeft />
                  <span className="sr-only">Forrige bilde</span>
               </Button>
               <Button
                  type="button"
                  onClick={onNext}
                  size="icon"
                  variant="secondary"
                  className="m-2 absolute top-[50%] right-0 z-50"
               >
                  <ChevronRight />
                  <span className="sr-only">Neste bilde</span>
               </Button>
               <Typography className="absolute top-[50%] text-white z-0 p-2">Henter bilde...</Typography>
               <img
                  loading="lazy"
                  className="max-h-[90vh] z-40 relative"
                  src={buildImageUrl(url, 1100)}
                  srcSet={[240, 560, 840, 1100, 1650, 2100, 2600, 3100]
                     .map((width) => `${buildImageUrl(url, width)} ${width}w`)
                     .join(", ")}
                  alt=""
                  sizes="100vw"
               />
            </div>
         </dialog>
      </>
   );
};
