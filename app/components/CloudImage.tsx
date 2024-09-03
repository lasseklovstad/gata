import { Image } from "@unpic/react";

import type { CloudinaryImage } from "db/schema";

type Props = {
   cloudImage: CloudinaryImage;
};

export const CloudImage = ({ cloudImage }: Props) => {
   const videoRegexp = /.*\/video\/upload\/.*/;
   const isVideo = videoRegexp.test(cloudImage.cloudUrl);
   if (isVideo) {
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <video className="rounded shadow h-full object-cover" src={cloudImage.cloudUrl} />;
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
