import { Image } from "@unpic/react";
import { Video } from "lucide-react";

import type { CloudinaryImage } from "db/schema";
import { getIsVideo } from "~/utils/cloudinaryUtils";

type Props = {
   cloudImage: CloudinaryImage;
};

export const CloudImage = ({ cloudImage }: Props) => {
   if (getIsVideo(cloudImage.cloudUrl)) {
      return (
         <div className="relative rounded shadow h-full object-cover">
            <video className="h-full" loop muted playsInline preload="metadata">
               <source src={cloudImage.cloudUrl} type="video/mp4"></source>
               <track default kind="captions" />
            </video>
            <Video className="absolute inset-2 bg-gray-50 shadow size-6 rounded" />
         </div>
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
