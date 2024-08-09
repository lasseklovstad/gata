import { formatDate } from "date-fns";

export const getDateWithTimeZone = (dateString: string) => {
   return new Date(dateString + "Z");
};

export const formatDateTime = (dateString: string) => {
   return formatDate(getDateWithTimeZone(dateString), "dd.MM.yyyy HH:mm");
};
