import { formatDate } from "date-fns";

export const getDateWithTimeZone = (dateString: string) => {
   return new Date(dateString + "Z");
};

export const formatDateTime = (dateString: string) => {
   return formatDate(getDateWithTimeZone(dateString), "dd.MM.yyyy HH:mm");
};

export const dayPickerLabels = {
   labelNext: () => "Gå til neste måned",
   labelPrevious: () => "Gå til forrige måned",
   labelMonthDropdown: () => "Velg måned",
   labelYearDropdown: () => "Velg år",
   labelGridcell: (date: Date) => formatDate(date, "PPPP"),
   labelDayButton: (date: Date) => formatDate(date, "PPPP"),
};
