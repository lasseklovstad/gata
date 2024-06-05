import { test, expect } from "@playwright/test";
import { GataHeader } from "../../pages/GataHeader";
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
    for (let res of preAddedResponsibilities) {
      await responsibilityPage.createNewResponsibility(
        res.name,
        res.description
      );
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
    await responsibilityPage.createNewResponsibility(
      "Formann",
      "Formann av Gata"
    );
  });
  test("Should edit responsibility", async ({ page }) => {
    const responsibilityPage = new ResponsibilityPage(page);
    await responsibilityPage.goto();
    await responsibilityPage.editResponsibility(
      preAddedResponsibilities[0].name,
      "Tim",
      "Ikke gunstig å ha denne."
    );
  });

  test("Should delete responsibility", async ({ page }) => {
    const responsibilityPage = new ResponsibilityPage(page);
    await responsibilityPage.goto();
    await responsibilityPage.deleteResponsibility(
      preAddedResponsibilities[0].name
    );
  });
});
