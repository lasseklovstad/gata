import { createCookie, createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";

import { getOptionalUserFromExternalUserId } from "~/.server/db/user";
import type { Auth0User } from "~/types/Auth0User";

import { env } from "./env.server";

const userPreferences = createCookie("user_pref", { maxAge: 5000 });

export const createAuthenticator = () => {
   const sessionStorage = createCookieSessionStorage({
      cookie: {
         name: "_remix_session",
         sameSite: "lax",
         path: "/",
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         secrets: [env.AUTH0_COOKIE_SECRET!],
      },
   });

   const authenticator = new Authenticator<Auth0User>(sessionStorage);

   const auth0Strategy = new Auth0Strategy(
      {
         callbackURL: "/callback",
         clientID: env.AUTH0_CLIENT_ID!,
         audience: env.AUTH0_AUDIENCE!,
         clientSecret: env.AUTH0_CLIENT_SECRET!,
         domain: env.AUTH0_DOMAIN!,
      },
      ({ profile, accessToken }) => {
         // Get the user data from your DB or API using the tokens and profile
         return Promise.resolve({ profile, accessToken });
      }
   );

   authenticator.use(auth0Strategy);

   const { getSession, destroySession } = sessionStorage;

   const getRequiredUser = async (request: Request) => {
      const auth = await authenticator.isAuthenticated(request);
      const url = new URL(request.url);
      const headers = {
         "Set-Cookie": await userPreferences.serialize({ loginPath: url.pathname }),
      };

      if (!auth) {
         throw redirect("/login", { headers });
      }
      const user = auth.profile.id
         ? (await getOptionalUserFromExternalUserId(auth.profile.id)) ?? undefined
         : undefined;

      if (!user) {
         throw redirect("/login", { headers });
      }

      return user;
   };

   const getSessionLoginPath = async (request: Request) => {
      const cookieHeader = request.headers.get("Cookie");
      const path = (await userPreferences.parse(cookieHeader))?.loginPath;
      return path;
   };

   return {
      getSession,
      destroySession,
      authenticator,
      getRequiredUser,
      getSessionLoginPath,
   };
};
