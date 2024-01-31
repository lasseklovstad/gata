import { expect, Locator, Page } from "@playwright/test";

export const selectComboBoxOption = async (
  page: Page,
  comboBox: Locator,
  optionName: string
) => {
  await expect(comboBox).toBeVisible();
  await comboBox.fill(optionName);
  await page.getByRole("option", { name: optionName, exact: true }).click();
};

export const selectSingleComboBoxOption = async (
  page: Page,
  comboBox: Locator,
  optionName: string
) => {
  await expect(comboBox).toBeVisible();
  await comboBox.click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
};
