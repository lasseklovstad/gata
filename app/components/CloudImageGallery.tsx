import { useState } from "react";

import type { CloudinaryImage } from "db/schema";
import { Likes } from "~/routes/event.$eventId._index/Likes";

import { CloudImageButton } from "./CloudImageButton";
import { CloudImageFullscreen } from "./CloudImageFullscreen";

type Props = {
   cloudImages: (CloudinaryImage & {
      likes: { type: string; userId: string; user: { name: string; picture: string } }[];
   })[];
   eventId: number;
   loggedInUserId: string;
};

export const CloudImageGallery = ({ cloudImages, eventId, loggedInUserId }: Props) => {
   const [selectedIndex, setSelectedIndex] = useState(-1);
   const selectedImage = selectedIndex !== -1 ? cloudImages[selectedIndex] : undefined;
   return (
      <>
         <ul className="flex gap-2 flex-wrap">
            {cloudImages.map((image, index) => (
               <li key={image.cloudId} className="h-[160px] w-[160px] relative overflow-hidden">
                  <CloudImageButton cloudImage={image} onClick={() => setSelectedIndex(index)} />
                  {image.likes.length > 0 ? (
                     <Likes
                        likes={image.likes}
                        size="normal"
                        className="absolute bottom-0 text-white bg-black/40 p-1 rounded-lg"
                     />
                  ) : null}
               </li>
            ))}
         </ul>
         {selectedImage ? (
            <CloudImageFullscreen
               cloudImage={selectedImage}
               onNext={() => {
                  const nextIndex = selectedIndex + 2 > cloudImages.length ? 0 : selectedIndex + 1;
                  setSelectedIndex(nextIndex);
               }}
               onPrevious={() => {
                  const nextIndex = selectedIndex - 1 < 0 ? cloudImages.length - 1 : selectedIndex - 1;
                  setSelectedIndex(nextIndex);
               }}
               onClose={() => setSelectedIndex(-1)}
               showNextAndPreviousButtons={cloudImages.length > 1}
               eventId={eventId}
               loggedInUserId={loggedInUserId}
            />
         ) : null}
      </>
   );
};
