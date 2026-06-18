import { Video } from "lucide-react";

import type { CloudinaryImage } from "db/schema";
import { getIsVideo, transformCloudflare } from "~/utils/file.utils";

type Props = {
   cloudImage: CloudinaryImage;
};

export const CloudImage = ({ cloudImage }: Props) => {
   if (getIsVideo(cloudImage)) {
      return (
         <div className="relative h-full object-cover">
            <video className="h-full rounded shadow-sm" loop muted playsInline preload="metadata">
               {/* Hack for ios for showing thumbnail: https://forums.developer.apple.com/forums/thread/129377 */}
               <source src={cloudImage.cloudUrl + "#t=0.001"} type="video/mp4"></source>
               <track default kind="captions" />
            </video>
            <Video className="absolute inset-2 bg-gray-50 shadow-sm size-6 rounded" />
         </div>
      );
   }
   return (
      <img
         className="rounded shadow-sm h-full object-cover"
         src={transformCloudflare(cloudImage.cloudUrl)}
         alt=""
         height={300}
         width={200}
      />
   );
};
