import { createCookie, createCookieSessionStorage, redirect } from "react-router";
import { Authenticator } from "remix-auth";

import { getOptionalUserFromExternalUserId } from "~/.server/db/user";
import type { Auth0User } from "~/types/Auth0User";

import { env } from "./env.server";
import { Auth0Strategy } from "./auth0";

type UserPreference = {
   loginPath: string;
};
const userPreferences = createCookie("user_pref", { maxAge: 120 });

export const createAuthenticator = () => {
   const sessionStorage = createCookieSessionStorage<{ user: Auth0User }>({
      cookie: {
         name: "_remix_session",
         sameSite: "lax",
         path: "/",
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         secrets: [env.AUTH0_COOKIE_SECRET],
         maxAge: 60 * 60 * 24 * 400, // 400 days
      },
   });

   const authenticator = new Authenticator<Auth0User>();

   const auth0Strategy = new Auth0Strategy(
      {
         redirectURI: env.AUTH0_CALLBACK,
         clientId: env.AUTH0_CLIENT_ID,
         audience: env.AUTH0_AUDIENCE,
         clientSecret: env.AUTH0_CLIENT_SECRET,
         domain: env.AUTH0_DOMAIN,
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

   const getOptionalUser = async (request: Request) => {
      const session = await sessionStorage.getSession(request.headers.get("cookie"));
      return session.get("user");
   };

   const getRequiredUser = async (request: Request) => {
      const session = await sessionStorage.getSession(request.headers.get("cookie"));
      const auth = session.get("user");
      const url = new URL(request.url);
      const headers = {
         "Set-Cookie": await userPreferences.serialize({ loginPath: url.pathname } satisfies UserPreference),
      };

      if (!auth) {
         throw redirect("/login", { headers });
      }
      const user = auth.id ? ((await getOptionalUserFromExternalUserId(auth.id)) ?? undefined) : undefined;

      if (!user) {
         throw redirect("/login", { headers });
      }

      return user;
   };

   const getSessionLoginPath = async (request: Request) => {
      const cookieHeader = request.headers.get("Cookie");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const userPreference: UserPreference | null = await userPreferences.parse(cookieHeader);
      const path = userPreference?.loginPath;
      return path;
   };

   return {
      sessionStorage,
      authenticator,
      getRequiredUser,
      getOptionalUser,
      getSessionLoginPath,
   };
};
