import { test as base, expect } from "@playwright/test";
import { GataHeader } from "../../pages/GataHeader";
import { ResponsibilityPage } from "../../pages/ResponsibilityPage";

base.use({ storageState: "adminStorageState.json" });

const preAddedResponsibilities = [
  { name: "Aktivitetsansvarlig", description: "Planlegg aktiviteter" },
  { name: "Kultur", description: "Vedlikeholder gatas kultur og historie" },
  { name: "Musikk", description: "Ordner musikk til arangement" },
];

const test = base.extend<{ responsibilityPage: ResponsibilityPage }>({
  responsibilityPage: async ({ page }, use) => {
    const gataHeader = new GataHeader(page);
    const responsibilityPage = new ResponsibilityPage(page);
    // Navigate
    await page.goto("/");
    await gataHeader.responsibilityLink.click();
    for (let res of preAddedResponsibilities) {
      await responsibilityPage.createNewResponsibility(
        res.name,
        res.description
      );
    }

    await use(responsibilityPage);
    // Optional cleanup

    await responsibilityPage.deleteAllResponsibilities();
  },
});

test("Should create responsibility", async ({ responsibilityPage }) => {
  await responsibilityPage.createNewResponsibility(
    "Formann",
    "Formann av Gata"
  );
});

test("Should edit responsibility", async ({ responsibilityPage }) => {
  await responsibilityPage.editResponsibility(
    preAddedResponsibilities[0].name,
    "Tim",
    "Ikke gunstig å ha denne."
  );
});

test("Should delete responsibility", async ({ responsibilityPage }) => {
  await responsibilityPage.deleteResponsibility(
    preAddedResponsibilities[0].name
  );
});
