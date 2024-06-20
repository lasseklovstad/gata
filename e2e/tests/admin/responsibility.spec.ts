import { expect, test } from "@playwright/test";

import { env } from "e2e/pages/Environment";
import { assignResponsibilityToMember, removeResponsibilityFromMember } from "e2e/utils/responsibilityUtils";

import { ResponsibilityPage } from "../../pages/ResponsibilityPage";

test.use({ storageState: "adminStorageState.json" });

const preAddedResponsibilities = [
   {
      name: "Aktivitetsansvarlig",
      description:
         "Tar ansvar for leker og andre aktiviteter som innebærer å ikke sitte stille i en sofa. Innebærer ikke å ta ansvar for organisering av større utflukter. Da skal det heller opprettes en reisekomité.",
   },
   {
      name: "Kulturansvarlig",
      description:
         "Tar ansvar for bevaring av Gatas kulturminner, for eksempel Lekeplassen, filmer og bilder, sitater og særegne uttrykk i Gata.",
   },
   { name: "Musikkansvarlig", description: "Tar ansvar for at det alltid er god musikk på Gata-arrangementer." },
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
      await expect(listItem).toContainText("Ansvarlig: Ingen");

      await test.step("Add responsibility to member and verify name shows in list", async () => {
         await assignResponsibilityToMember(page, env.memberUsername, respName, "member");
         await responsibilityPage.goto();

         await expect(listItem).toContainText("Ansvarlig: " + env.memberUsername);
      });

      await test.step("Add responsibility to admin and verify both names shows in list", async () => {
         await assignResponsibilityToMember(page, env.adminUsername, respName, "admin");
         await responsibilityPage.goto();
         await expect(listItem).toContainText("Ansvarlig: " + [env.adminUsername, env.memberUsername].join(", "));
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
