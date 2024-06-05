import { expect, Locator, Page } from "@playwright/test";
import { GataHeader } from "./GataHeader";

export class MemberOverviewPage {
  private readonly page: Page;
  private readonly header: GataHeader;
  private readonly pageTitle: Locator;
  private readonly listMembers: Locator;
  private readonly listLoggedInUsers: Locator;
  private readonly listNotMembers: Locator;
  private readonly listAdmins: Locator;
  readonly buttonContingent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new GataHeader(page);
    this.pageTitle = page.getByRole("heading", { name: "Brukere" });
    this.buttonContingent = page.getByRole("link", {
      name: "Kontigent",
      exact: true,
    });
    this.listMembers = page.getByRole("list", { name: "Medlemmer" });
    this.listAdmins = page.getByRole("list", { name: "Administrator" });
    this.listNotMembers = page.getByRole("list", { name: "Ikke medlem" });
    this.listLoggedInUsers = page.getByRole("list", {
      name: "Andre pålogginger",
    });
  }

  async goto() {
    await this.page.goto("");
    await this.header.memberLink.click();
    await expect(this.pageTitle).toBeVisible();
  }

  private getList(type: ListType) {
    const lists: Record<typeof type, Locator> = {
      admin: this.listAdmins,
      member: this.listMembers,
      notMember: this.listNotMembers,
      loggedIn: this.listLoggedInUsers,
    };
    return lists[type];
  }

  private getUserListItem(username: string, type: ListType) {
    return this.getList(type)
      .getByRole("listitem")
      .filter({ hasText: new RegExp(`^${username}`) });
  }

  async gotoUser(name: string, type: ListType) {
    await this.getUserListItem(name, type).click();
  }

  async verifyUsersInList(names: string | string[], type: ListType) {
    if (typeof names === "string") {
      await expect(this.getUserListItem(names, type)).toBeVisible();
    } else {
      await expect(this.getList(type).getByRole("listitem")).toHaveCount(
        names.length
      );
      for (const name of names) {
        await expect(this.getUserListItem(name, type)).toBeVisible();
      }
    }
  }

  async addUser(username: string) {
    await this.getUserListItem(username, "loggedIn")
      .getByRole("button", { name: "Legg til" })
      .click();
    await expect(this.getUserListItem(username, "notMember")).toBeVisible();
  }
}

type ListType = "admin" | "member" | "notMember" | "loggedIn";
