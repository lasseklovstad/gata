import type { CloudinaryImage } from "db/schema";

import { CloudImage } from "./CloudImage";

type Props = {
   cloudImage: CloudinaryImage;
};

export const CloudImageCheckbox = ({ cloudImage }: Props) => {
   return (
      <>
         {/* Need flex for iphone and firefox */}
         <label className="relative cursor-pointer flex">
            <CloudImage cloudImage={cloudImage} />
            <span className="sr-only">Velg bilde</span>
            <input
               name="image"
               value={cloudImage.cloudId}
               type="checkbox"
               className="size-8 absolute right-0 m-1 bottom-0 cursor-pointer"
            />
         </label>
      </>
   );
};
