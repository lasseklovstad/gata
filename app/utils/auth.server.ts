import { createCookie, createCookieSessionStorage, redirect } from "react-router";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";

import { getOptionalUserFromExternalUserId } from "~/.server/db/user";
import type { Auth0User } from "~/types/Auth0User";

import type { RoleName } from "./roleUtils";

type UserPreference = {
   loginPath: string;
};

const userPreferences = createCookie("user_pref", { maxAge: 120 });

export const sessionStorage = createCookieSessionStorage<{ user: Auth0User }>({
   cookie: {
      name: "_remix_session",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      secrets: [process.env.AUTH0_COOKIE_SECRET],
      maxAge: 60 * 60 * 24 * 400, // 400 days
   },
});

const authenticator = new Authenticator<Auth0User>();

/**
 * The OpenID Connect claims we read off the Auth0 `/userinfo` endpoint.
 * @see https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes#standard-claims
 */
type Auth0UserInfo = {
   sub?: string;
   name?: string;
   email?: string;
   picture?: string;
};

// `remix-auth-auth0` hands the verify callback the OAuth2 tokens but does not
// fetch the user profile for us, so we call the `/userinfo` endpoint ourselves
// (this is what the previous custom strategy did under the hood).
const fetchUserProfile = async (accessToken: string): Promise<Auth0User> => {
   const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
   });
   if (!response.ok) {
      throw new Error(`Klarte ikke hente brukerprofil fra Auth0 (status ${response.status})`);
   }
   const data = (await response.json()) as Auth0UserInfo;
   if (!data.sub) {
      throw new Error("Bruker har ikke id!");
   }
   if (!data.email) {
      throw new Error("Bruker har ikke email!");
   }
   return {
      id: data.sub,
      email: data.email,
      name: data.name,
      photo: data.picture,
   };
};

const auth0Strategy = new Auth0Strategy<Auth0User>(
   {
      redirectURI: process.env.AUTH0_CALLBACK,
      clientId: process.env.AUTH0_CLIENT_ID,
      audience: process.env.AUTH0_AUDIENCE,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
      scopes: ["openid", "profile", "email"],
   },
   ({ tokens }) => fetchUserProfile(tokens.accessToken())
);

authenticator.use(auth0Strategy);

export default authenticator;

export const getUserSession = async (request: Request) => {
   const session = await sessionStorage.getSession(request.headers.get("cookie"));
   return session.get("user");
};

export const getRequiredUser = async (request: Request, requiredRoles?: RoleName[]) => {
   const userSession = await getUserSession(request);
   const url = new URL(request.url);

   const user = userSession?.id ? ((await getOptionalUserFromExternalUserId(userSession.id)) ?? undefined) : undefined;

   if (!user) {
      // Save pathname for when the user comes back
      const headers = {
         "Set-Cookie": await userPreferences.serialize({ loginPath: url.pathname } satisfies UserPreference),
      };
      throw redirect("/login", { headers });
   }

   if (requiredRoles) {
      requiredRoles.forEach((role) => {
         const hasRole = user.roles.some(({ role: { roleName } }) => roleName === role);
         if (!hasRole) {
            throw new Response("Du har ikke tilgang til denne ressursen", { status: 403 });
         }
      });
   }

   return user;
};

export const getSessionLoginPath = async (request: Request) => {
   const cookieHeader = request.headers.get("Cookie");
   const userPreference = (await userPreferences.parse(cookieHeader)) as UserPreference | null;
   const path = userPreference?.loginPath;
   return path;
};
