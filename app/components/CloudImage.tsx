import { Image } from "@unpic/react";

import type { CloudinaryImage } from "db/schema";
import { getIsVideo } from "~/utils/cloudinaryUtils";

type Props = {
   cloudImage: CloudinaryImage;
};

export const CloudImage = ({ cloudImage }: Props) => {
   if (getIsVideo(cloudImage.cloudUrl)) {
      return (
         <video className="rounded shadow h-full object-cover" src={cloudImage.cloudUrl}>
            <track default kind="captions" />
         </video>
      );
   }
   return (
      <Image
         className="rounded shadow h-full object-cover"
         src={cloudImage.cloudUrl}
         alt=""
         height={300}
         unstyled
         background="auto"
         width={200}
      />
   );
};
