import { type AppLoadContext, createCookieSessionStorage, redirect } from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import type { Auth0Profile } from "remix-auth-auth0";
import { Auth0Strategy } from "remix-auth-auth0";

export const createAuthenticator = ({ cloudflare: { env } }: AppLoadContext) => {
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

   const authenticator = new Authenticator<{ profile: Auth0Profile; accessToken: string }>(sessionStorage);

   const auth0Strategy = new Auth0Strategy(
      {
         callbackURL: "/callback",
         clientID: env.AUTH0_CLIENT_ID!,
         audience: env.AUTH0_AUDIENCE!,
         clientSecret: env.AUTH0_CLIENT_SECRET!,
         domain: env.AUTH0_DOMAIN!,
      },
      // eslint-disable-next-line require-await
      async ({ profile, accessToken }) => {
         // Get the user data from your DB or API using the tokens and profile
         return { profile, accessToken };
      }
   );

   authenticator.use(auth0Strategy);

   const { getSession, destroySession } = sessionStorage;

   const getRequiredAuthToken = async (request: Request) => {
      const auth = await authenticator.isAuthenticated(request);
      if (auth === null) {
         throw redirect("/home");
      }
      return auth.accessToken;
   };

   return { getSession, destroySession, getRequiredAuthToken, authenticator };
};
