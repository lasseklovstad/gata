import type { Strategy } from "remix-auth/strategy";
import { OAuth2Strategy } from "remix-auth-oauth2";

interface Auth0StrategyOptions {
   domain: string;
   clientId: string;
   clientSecret: string;
   redirectURI: string;
   scope?: Auth0Scope[];
   audience?: string;
   organization?: string;
   invitation?: string;
   connection?: string;
}

interface Auth0Profile {
   id?: string;
   emails?: { value: string }[];
   photos?: { value: string }[];
   displayName?: string;
   provider: string;
   name?: { middleName?: string; givenName?: string; familyName?: string };
   _json?: Auth0UserInfo;
   organizationId?: string;
   organizationName?: string;
}

/**
 * @see https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes#standard-claims
 */
type Auth0Scope = "openid" | "profile" | "email";

interface Auth0UserInfo {
   sub?: string;
   name?: string;
   given_name?: string;
   family_name?: string;
   middle_name?: string;
   nickname?: string;
   preferred_username?: string;
   profile?: string;
   picture?: string;
   website?: string;
   email?: string;
   email_verified?: boolean;
   gender?: string;
   birthdate?: string;
   zoneinfo?: string;
   locale?: string;
   phone_number?: string;
   phone_number_verified?: boolean;
   address?: {
      country?: string;
   };
   updated_at?: string;
   org_id?: string;
   org_name?: string;
}

const Auth0StrategyDefaultName = "auth0";
const Auth0StrategyDefaultScope: Auth0Scope[] = ["openid", "profile", "email"];
const Auth0StrategyScopeSeperator = " ";

export class Auth0Strategy<User> extends OAuth2Strategy<User> {
   name = Auth0StrategyDefaultName;

   private userInfoURL: string;
   private scope: Auth0Scope[];
   private audience?: string;
   private organization?: string;
   private invitation?: string;
   private connection?: string;
   private fetchProfile: boolean;

   constructor(
      options: Auth0StrategyOptions,
      verify: Strategy.VerifyFunction<User, OAuth2Strategy.VerifyOptions & { profile: Auth0Profile }>
   ) {
      super(
         {
            authorizationEndpoint: `https://${options.domain}/authorize`,
            tokenEndpoint: `https://${options.domain}/oauth/token`,
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            redirectURI: options.redirectURI,
         },
         async (verifyOptions) => {
            const profile = await this.userProfile(verifyOptions.tokens.accessToken());
            return verify({ ...verifyOptions, profile });
         }
      );

      this.userInfoURL = `https://${options.domain}/userinfo`;
      this.scope = this.getScope(options.scope);
      this.audience = options.audience;
      this.organization = options.organization;
      this.invitation = options.invitation;
      this.connection = options.connection;
      this.fetchProfile = this.scope.join(Auth0StrategyScopeSeperator).includes("openid");
   }

   // Allow users the option to pass a scope string, or typed array
   private getScope(scope: Auth0StrategyOptions["scope"]) {
      return scope ?? Auth0StrategyDefaultScope;
   }

   protected authorizationParams(params: URLSearchParams) {
      params.set("scope", this.scope.join(Auth0StrategyScopeSeperator));
      if (this.audience) {
         params.set("audience", this.audience);
      }
      if (this.organization) {
         params.set("organization", this.organization);
      }
      if (this.invitation) {
         params.set("invitation", this.invitation);
      }
      if (this.connection) {
         params.set("connection", this.connection);
      }

      return params;
   }

   protected async userProfile(accessToken: string): Promise<Auth0Profile> {
      const profile: Auth0Profile = {
         provider: Auth0StrategyDefaultName,
      };

      if (!this.fetchProfile) {
         return profile;
      }

      const response = await fetch(this.userInfoURL, {
         headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await response.json()) as Auth0UserInfo;
      profile._json = data;
      if (data.sub) {
         profile.id = data.sub;
      }

      if (data.name) {
         profile.displayName = data.name;
      }

      if (data.family_name || data.given_name || data.middle_name) {
         profile.name = {};

         if (data.family_name) {
            profile.name.familyName = data.family_name;
         }

         if (data.given_name) {
            profile.name.givenName = data.given_name;
         }

         if (data.middle_name) {
            profile.name.middleName = data.middle_name;
         }
      }

      if (data.email) {
         profile.emails = [{ value: data.email }];
      }

      if (data.picture) {
         profile.photos = [{ value: data.picture }];
      }

      if (data.org_id) {
         profile.organizationId = data.org_id;
      }

      if (data.org_name) {
         profile.organizationName = data.org_name;
      }

      return profile;
   }
}
