export const getCloudinaryUploadFolder = () => {
   return process.env.NODE_ENV === "production" ? "gata" : "gata-local";
};

export const getIsVideo = (cloudUrl: string) => {
   const videoRegexp = /.*\/video\/upload\/.*/;
   return videoRegexp.test(cloudUrl);
};
