export const getCloudinaryUploadFolder = () => {
   return process.env.NODE_ENV === "production" ? "gata" : "gata-local";
};
