import type { CloudinaryImage } from "db/schema";

export const getCloudinaryUploadFolder = () => {
   return process.env.NODE_ENV === "production" ? "gata" : "gata-local";
};

export const getIsVideo = (image: CloudinaryImage) => {
   const videoRegexp = /.*\/video\/upload\/.*/;
   return videoRegexp.test(image.cloudUrl) || image.type?.startsWith("video");
};
