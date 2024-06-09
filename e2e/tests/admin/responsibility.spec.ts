import { expect, test } from "@playwright/test";

import { env } from "e2e/pages/Environment";
import { addResponsibilityToMember, removeResponsibilityFromMember } from "e2e/utils/responsibilityUtils";

import { ResponsibilityPage } from "../../pages/ResponsibilityPage";

test.use({ storageState: "adminStorageState.json" });

const preAddedResponsibilities = [
   { name: "Aktivitetsansvarlig", description: "Planlegg aktiviteter" },
   { name: "Kultur", description: "Vedlikeholder gatas kultur og historie" },
   { name: "Musikk", description: "Ordner musikk til arangement" },
];

test.describe("Responsibility page", () => {
   test.beforeEach(async ({ page }) => {
      const responsibilityPage = new ResponsibilityPage(page);
      // Navigate
      await responsibilityPage.goto();
      for (const res of preAddedResponsibilities) {
         await responsibilityPage.createNewResponsibility(res.name, res.description);
      }
   });
   test.afterEach(async ({ page }) => {
      const responsibilityPage = new ResponsibilityPage(page);
      await responsibilityPage.goto();
      await responsibilityPage.deleteAllResponsibilities();
   });
   test("Should create responsibility", async ({ page }) => {
      const responsibilityPage = new ResponsibilityPage(page);
      await responsibilityPage.goto();
      await responsibilityPage.createNewResponsibility("Formann", "Formann av Gata");
   });
   test("Should edit responsibility", async ({ page }) => {
      const responsibilityPage = new ResponsibilityPage(page);
      await responsibilityPage.goto();
      await responsibilityPage.editResponsibility(preAddedResponsibilities[0].name, "Tim", "Ikke gunstig å ha denne.");
   });

   test("Should show users responsible this year", async ({ page }) => {
      const responsibilityPage = new ResponsibilityPage(page);
      const respName = preAddedResponsibilities[0].name;
      const { listItem } = responsibilityPage.getResponsibilityListItem(respName);
      await expect(listItem).toHaveText("Ansvarlig: Ingen");

      await test.step("Add responsibility to member and verify name shows in list", async () => {
         await addResponsibilityToMember(page, respName, env.memberUsername, "member");
         await responsibilityPage.goto();

         await expect(listItem).toHaveText("Ansvarlig: " + env.memberUsername);
      });

      await test.step("Add responsibility to admin and verify both names shows in list", async () => {
         await addResponsibilityToMember(page, respName, env.memberUsername, "member");
         await responsibilityPage.goto();
         await expect(listItem).toHaveText("Ansvarlig: " + [env.memberUsername, env.adminUsername].join(", "));
      });

      // Cleanup

      await removeResponsibilityFromMember(page, respName, env.memberUsername, "member");
      await removeResponsibilityFromMember(page, respName, env.adminUsername, "admin");
   });

   test("Should delete responsibility", async ({ page }) => {
      const responsibilityPage = new ResponsibilityPage(page);
      await responsibilityPage.goto();
      await responsibilityPage.deleteResponsibility(preAddedResponsibilities[0].name);
   });
});
