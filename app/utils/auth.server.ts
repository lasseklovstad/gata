import { createCookie, createCookieSessionStorage, redirect } from "react-router";
import { Authenticator } from "remix-auth";

import { getOptionalUserFromExternalUserId } from "~/.server/db/user";
import type { Auth0User } from "~/types/Auth0User";

import { Auth0Strategy } from "./auth0";
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

const auth0Strategy = new Auth0Strategy(
   {
      redirectURI: process.env.AUTH0_CALLBACK,
      clientId: process.env.AUTH0_CLIENT_ID,
      audience: process.env.AUTH0_AUDIENCE,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
   },
   ({ profile }) => {
      const id = profile.id;
      const email = profile.emails ? profile.emails[0]?.value : undefined;
      if (!id) {
         throw new Error("Bruker har ikke id!");
      }
      if (!email) {
         throw new Error("Bruker har ikke email!");
      }
      // Get the user data from your DB or API using the tokens and profile
      const user = {
         email,
         id,
         photo: profile.photos ? profile.photos[0]?.value : undefined,
         name: profile.displayName,
      };

      return Promise.resolve(user);
   }
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
