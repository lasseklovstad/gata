export class Environment {
  baseUrl: string;
  adminUsername: string;
  adminPassword: string;
  memberUsername: string;
  memberPassword: string;
  nonMemberUsername: string;
  nonMemberPassword: string;
  skipSetup: boolean;

  constructor() {
    this.baseUrl = this.validateEnv("PLAYWRIGHT_BASE_URL");
    this.adminPassword = this.validateEnv("PLAYWRIGHT_ADMIN_PASSWORD");
    this.adminUsername = this.validateEnv("PLAYWRIGHT_ADMIN_USERNAME");

    this.memberPassword = this.validateEnv("PLAYWRIGHT_MEMBER_PASSWORD");
    this.memberUsername = this.validateEnv("PLAYWRIGHT_MEMBER_USERNAME");

    this.nonMemberPassword = this.validateEnv("PLAYWRIGHT_NONMEMBER_PASSWORD");
    this.nonMemberUsername = this.validateEnv("PLAYWRIGHT_NONMEMBER_USERNAME");
    this.skipSetup = process.env.SKIP_SETUP === "true";
  }

  private validateEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(
        `Miljø variabel med navn ${key} er ikke funnet! \n Det kan hende du mangler en .env fil...`
      );
    }
    return value;
  }
}

export const env = new Environment();
