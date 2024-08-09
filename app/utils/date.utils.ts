import { formatDate } from "date-fns";
import type { Labels } from "react-day-picker";

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
   labelGridcell: (date, modifiers, options) => formatDate(date, "PPPP", options),
   labelDayButton: (date, modifiers, options) => formatDate(date, "PPPP", options),
} satisfies Partial<Labels>;
