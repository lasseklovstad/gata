import type { CloudinaryImage } from "db/schema";

import { CloudImage } from "./CloudImage";

type Props = {
   cloudImage: CloudinaryImage;
   onClick: () => void;
};

export const CloudImageButton = ({ cloudImage, onClick }: Props) => {
   return (
      <button
         type="button"
         onClick={onClick}
         className="outline-0 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 h-full w-full"
      >
         <CloudImage cloudImage={cloudImage} />
         <span className="sr-only">Se bilde i fullskjerm</span>
      </button>
   );
};
