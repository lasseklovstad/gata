import { expect, Locator, Page } from "@playwright/test";

export const selectComboboxOption = async (
  page: Page,
  combobox: Locator,
  optionName: string
) => {
  await expect(combobox).toBeVisible();
  await combobox.fill(optionName);
  const listboxId = await combobox.getAttribute("aria-controls");
  const listBox = page.locator(`#${listboxId}`);
  await listBox.locator("role=button", { hasText: optionName }).click();
  await expect(listBox).toBeHidden();
};
