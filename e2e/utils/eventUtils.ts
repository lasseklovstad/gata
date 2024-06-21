import type { Locator } from "@playwright/test";
import { formatDate } from "date-fns";
import { nb } from "date-fns/locale";

export const selectDate = async (date: Date, container: Locator) => {
   const year = formatDate(date, "yyyy", { locale: nb });
   const month = formatDate(date, "MMMM", { locale: nb });
   const day = formatDate(date, "d", { locale: nb });
   await container.getByLabel("Velg år").selectOption(year);
   await container.getByLabel("Velg måned").selectOption(month);
   await container.getByRole("grid").getByRole("gridcell", { name: day, exact: true }).click();
};
