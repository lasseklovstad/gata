export const buildImageUrl = (url: string, size: number, direction?: "height" | "width") => {
   // https://res.cloudinary.com/dsiqlprku/image/upload/v1718532608/gata/event-1/uyr8gc2p5ysevbnutyk1.jpg
   // To seperate the image name and cloud url
   const cloudinaryUrlRegex = /(^.*\/image\/upload\/)(.*$)/i;
   const match = cloudinaryUrlRegex.exec(url);
   const rootUrl = match && match[1];
   const nameUrl = match && match[2];
   if (!rootUrl || !nameUrl) {
      throw new Error("Could not parse image url " + url);
   }
   return `${rootUrl}${["q_auto", "f_auto", (direction === "height" ? "h_" : "w_") + size].join(",")}/${nameUrl}`;
};
