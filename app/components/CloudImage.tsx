import type { CloudinaryImage } from "db/schema";
import { buildImageUrl } from "~/utils/cloudinaryUtils";

type Props = {
   cloudImage: CloudinaryImage;
};

export const CloudImage = ({ cloudImage }: Props) => {
   return (
      <img
         loading="lazy"
         className="rounded shadow h-[160px]"
         src={buildImageUrl(cloudImage.cloudUrl, 300, "height")}
         alt=""
      />
   );
};
