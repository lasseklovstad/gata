import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { selectDate } from "e2e/utils/eventUtils";

import { ConfirmModal } from "./ConfirmModal";

export const EventPollPage = (page: Page) => {
   const mainHeading = page.getByRole("heading", { name: "Avstemninger" });
   const buttonCreatePoll = page.getByRole("button", { name: "Ny avstemning" });
   const dialogPoll = page.getByRole("dialog", { name: "Ny Avstemning" });
   const dialogAddPollOptions = page.getByRole("dialog", { name: "Legg til alternativer" });
   const inputName = dialogPoll.getByLabel("Navn");
   const radioGroupType = dialogPoll.getByRole("group", { name: "Velg type" });
   const checkboxCanSelectMultiple = dialogPoll.getByRole("checkbox", {
      name: "La brukere stemme på flere alternativer",
   });
   const checkboxIsAnonymous = dialogPoll.getByRole("checkbox", {
      name: "Anonym avstemning",
   });
   const checkboxCanAddSuggestions = dialogPoll.getByRole("checkbox", {
      name: "La brukere foreslå andre alternativer",
   });
   const buttonSubmit = dialogPoll.getByRole("button", { name: "Opprett" });
   const buttonCancel = dialogPoll.getByRole("button", { name: "Avbryt" });

   type PollForm = {
      name: string;
      isAnonymous?: boolean;
      canSelectMultiple?: boolean;
      canAddSuggestions?: boolean;
   } & PollFormOptions;

   type PollFormOptions = { type: "Tekst"; options: string[] } | { type: "Dato"; options: Date[] };

   const addDateOptions = async (options: Date[], container: Locator) => {
      for (let index = 0; index < options.length; index++) {
         await selectDate(options[index], container);
      }
   };

   const addTextOptions = async (options: string[], container: Locator) => {
      for (let index = 0; index < options.length; index++) {
         if (index > 0) {
            await container.getByRole("button", { name: "Legg til alternativ" }).click();
         }
         await getInputTextOption(index, container).fill(options[index]);
      }
   };

   const fillForm = async ({ name, type, canAddSuggestions, isAnonymous, canSelectMultiple, options }: PollForm) => {
      await inputName.fill(name);
      await getRadioType(type).click();
      if (type === "Tekst") {
         await addTextOptions(options, dialogPoll);
      }
      if (type === "Dato") {
         await addDateOptions(options, dialogPoll);
      }
      canAddSuggestions && (await checkboxCanAddSuggestions.check());
      isAnonymous && (await checkboxIsAnonymous.check());
      canSelectMultiple && (await checkboxCanSelectMultiple.check());
   };

   const getRadioType = (type: "Tekst" | "Dato") => radioGroupType.getByRole("radio", { name: type });
   const getInputTextOption = (index: number, container: Locator) => container.getByLabel(`Alternativ ${index + 1}`);
   const getOptionListItems = () => dialogPoll.getByRole("list", { name: "Alternativer" }).getByRole("listitem");
   const deleteInputTextOption = async (index = 0) => {
      await dialogPoll.getByRole("button", { name: `Fjern Alternativ ${index + 1}` }).click();
   };
   const getPollTableForm = (name: string) => page.getByRole("table", { name });
   const verifyPollTableHeader = async (
      name: string,
      canSelectMultiple: boolean,
      options: string[],
      votes: string[],
      rows: Record<string, boolean[]>
   ) => {
      const table = getPollTableForm(name);
      await expect(table).toBeVisible();
      await expect(table.getByRole("columnheader", { name: "Brukere" })).toBeVisible();
      for (const option of options) {
         await expect(table.getByRole("columnheader", { name: option })).toBeVisible();
      }
      const resultRow = table.getByRole("row", { name: "Resultat" });
      await expect(resultRow).toBeVisible();
      for (let index = 0; index < votes.length; index++) {
         await expect(resultRow.getByRole("columnheader").nth(index)).toHaveAccessibleName(votes[index]);
      }
      for (const username in rows) {
         const row = table.getByRole("row", { name: username });
         await expect(row).toBeVisible();
         const selectedOptions = rows[username];
         for (let index = 0; index < selectedOptions.length; index++) {
            const isChecked = selectedOptions[index];
            const option = row
               .getByRole("cell")
               .nth(index)
               .getByRole(canSelectMultiple ? "checkbox" : "radio");
            if (isChecked) {
               await expect(option).toBeChecked();
            } else {
               await expect(option).not.toBeChecked();
            }
         }
      }
   };

   const checkTablePollOption = async (
      tableName: string,
      canSelectMultiple: boolean,
      username: string,
      optionText: string,
      check = true
   ) => {
      const table = getPollTableForm(tableName);
      const row = table.getByRole("row", { name: username });
      const option = row.getByRole("cell").getByRole(canSelectMultiple ? "checkbox" : "radio", { name: optionText });
      check ? await option.check() : await option.uncheck();
   };

   type EditPollForm = {
      name?: string;
      isActive?: boolean;
   };

   const editPoll = async (pollName: string, pollForm: EditPollForm) => {
      await page.getByRole("button", { name: `Åpne meny for avstemning ${pollName}` }).click();
      await page.getByRole("menuitem", { name: "Rediger" }).click();
      const dialog = page.getByRole("dialog", { name: "Rediger avstemning" });
      if (pollForm.name !== undefined) {
         await dialog.getByLabel("Navn").fill(pollForm.name);
      }
      if (pollForm.isActive !== undefined) {
         const activeCheckbox = dialog.getByLabel("Avslutt avstemning");
         !pollForm.isActive ? await activeCheckbox.check() : await activeCheckbox.uncheck();
      }
      await dialog.getByRole("button", { name: "Lagre" }).click();
   };

   const deletePoll = async (pollName: string) => {
      await page.getByRole("button", { name: `Åpne meny for avstemning ${pollName}` }).click();
      await page.getByRole("menuitem", { name: "Slett" }).click();
      const confirmDialog = new ConfirmModal(page);
      await confirmDialog.confirm();
   };

   const verifyPollTableRowDisabled = async (tableName: string, canSelectMultiple: boolean, username: string) => {
      const table = getPollTableForm(tableName);
      const row = table.getByRole("row", { name: username });
      const options = row.getByRole("cell").getByRole(canSelectMultiple ? "checkbox" : "radio");
      for (const option of await options.all()) {
         await expect(option).toBeDisabled();
      }
   };

   const verifyPollListIsDisabled = async (name: string, canSelectMultiple: boolean) => {
      const pollList = page.getByRole("list", { name });
      const options = pollList.getByRole(canSelectMultiple ? "checkbox" : "radio");
      for (const option of await options.all()) {
         await expect(option).toBeDisabled();
      }
   };

   const verifyPollList = async (
      name: string,
      canSelectMultiple: boolean,
      options: string[],
      votes: string[],
      checkedOptions: boolean[]
   ) => {
      const pollList = page.getByRole("list", { name });
      for (let i = 0; i < options.length; i++) {
         const option = options[i];
         const vote = votes[i];
         const isChecked = checkedOptions[i];
         const optionListItem = pollList.getByRole("listitem").filter({ hasText: option });
         await expect(optionListItem).toBeVisible();
         await expect(optionListItem).toContainText(option);
         await expect(optionListItem).toContainText(vote);
         await expect(
            optionListItem.getByRole("list", { name: "Brukere som har stemt" }).getByRole("listitem")
         ).toHaveCount(Number(vote));
         const checkboxOrRadio = optionListItem.getByRole(canSelectMultiple ? "checkbox" : "radio");
         await (isChecked ? expect(checkboxOrRadio).toBeChecked() : expect(checkboxOrRadio).not.toBeChecked());
      }
   };

   const checkListPollOption = async (
      listName: string,
      canSelectMultiple: boolean,
      optionText: string,
      check = true
   ) => {
      const pollList = page.getByRole("list", { name: listName });
      const option = pollList
         .getByRole("listitem")
         .getByRole(canSelectMultiple ? "checkbox" : "radio", { name: optionText });
      check ? await option.check() : await option.uncheck();
   };

   const addPollOptions = async (pollName: string, { type, options }: PollFormOptions) => {
      await page.getByRole("region", { name: pollName }).getByRole("button", { name: "Legg til alternativer" }).click();
      if (type === "Tekst") {
         await addTextOptions(options, dialogAddPollOptions);
      }
      if (type === "Dato") {
         await addDateOptions(options, dialogAddPollOptions);
      }
      await dialogAddPollOptions.getByRole("button", { name: "Legg til" }).click();
   };

   return {
      mainHeading,
      buttonCreatePoll,
      buttonCancel,
      buttonSubmit,
      dialogPoll,
      fillForm,
      inputName,
      radioGroupType,
      getRadioType,
      getInputTextOption,
      checkboxCanAddSuggestions,
      checkboxCanSelectMultiple,
      checkboxIsAnonymous,
      deleteInputTextOption,
      getOptionListItems,
      getPollTableForm,
      verifyPollTableHeader,
      checkTablePollOption,
      editPoll,
      verifyPollTableRowDisabled,
      verifyPollList,
      checkListPollOption,
      verifyPollListIsDisabled,
      deletePoll,
      addPollOptions,
   };
};
