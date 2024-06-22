import { useState } from "react";

import type { CloudinaryImage } from "db/schema";

import { CloudImageButton } from "./CloudImageButton";
import { CloudImageFullscreen } from "./CloudImageFullscreen";

type Props = {
   cloudImages: CloudinaryImage[];
};

export const CloudImageGallery = ({ cloudImages }: Props) => {
   const [selectedIndex, setSelectedIndex] = useState(-1);
   const selectedImage = selectedIndex !== -1 ? cloudImages[selectedIndex] : undefined;
   return (
      <>
         <ul className="flex gap-2 flex-wrap">
            {cloudImages.map((image, index) => (
               <li key={image.cloudId}>
                  <CloudImageButton cloudImage={image} onClick={() => setSelectedIndex(index)} />
               </li>
            ))}
         </ul>
         {selectedImage ? (
            <CloudImageFullscreen
               url={selectedImage.cloudUrl}
               onNext={() => {
                  const nextIndex = selectedIndex + 2 > cloudImages.length ? 0 : selectedIndex + 1;
                  setSelectedIndex(nextIndex);
               }}
               onPrevious={() => {
                  const nextIndex = selectedIndex - 1 < 0 ? cloudImages.length - 1 : selectedIndex - 1;
                  setSelectedIndex(nextIndex);
               }}
               onClose={() => setSelectedIndex(-1)}
            />
         ) : null}
      </>
   );
};
