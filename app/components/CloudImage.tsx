import { Image } from "@unpic/react";

import type { CloudinaryImage } from "db/schema";

type Props = {
   cloudImage: CloudinaryImage;
};

export const CloudImage = ({ cloudImage }: Props) => {
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
