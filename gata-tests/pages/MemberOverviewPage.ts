import { expect, Locator, Page } from "@playwright/test";
import { GataHeader } from "./GataHeader";

export class MemberOverviewPage {
  private readonly page: Page;
  header: GataHeader;
  pageTitle: Locator;
  listMembers: Locator;
  listLoggedInUsers: Locator;
  listNotMembers: Locator;
  listAdmins: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new GataHeader(page);
    this.pageTitle = page.getByRole("heading", { name: "Brukere" });
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

  private getUserListItem(
    username: string,
    type: "admin" | "member" | "notMember" | "loggedIn"
  ) {
    const lists: Record<typeof type, Locator> = {
      admin: this.listAdmins,
      member: this.listMembers,
      notMember: this.listNotMembers,
      loggedIn: this.listLoggedInUsers,
    };
    return lists[type]
      .getByRole("listitem")
      .filter({ hasText: new RegExp(`^${username}`) });
  }

  async goToMember(name: string) {
    await this.getUserListItem(name, "member").click();
  }

  async goToNonMember(name: string) {
    await this.getUserListItem(name, "notMember").click();
  }

  async verifyMember(name: string) {
    await expect(this.getUserListItem(name, "member")).toBeVisible();
  }

  async addUser(username: string) {
    await this.getUserListItem(username, "loggedIn")
      .getByRole("button", { name: "Legg til" })
      .click();
    await expect(this.getUserListItem(username, "notMember")).toBeVisible();
  }
}
