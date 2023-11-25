import { expect, Locator, Page } from "@playwright/test";

export const selectComboBoxOption = async (
  page: Page,
  comboBox: Locator,
  optionName: string
) => {
  await expect(comboBox).toBeVisible();
  await comboBox.fill(optionName);
  const listBoxId = await comboBox.getAttribute("aria-controls");
  const listBox = page.locator(`#${listBoxId}`);
  await listBox.getByRole("button").filter({ hasText: optionName }).click();
  await expect(listBox).toBeHidden();
};

export const selectSingleComboBoxOption = async (
  page: Page,
  comboBox: Locator,
  optionName: string
) => {
  await expect(comboBox).toBeVisible();
  await comboBox.click();
  const listBoxId = await comboBox.getAttribute("aria-controls");
  const listBox = page.locator(`#${listBoxId}`);
  await listBox.getByRole("button", { name: optionName, exact: true }).click();
  await expect(listBox).toBeHidden();
};
