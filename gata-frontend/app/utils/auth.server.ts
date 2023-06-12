import { createCookieSessionStorage } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import type { Auth0Profile } from "remix-auth-auth0";
import { Auth0Strategy } from "remix-auth-auth0";

const sessionStorage = createCookieSessionStorage({
   cookie: {
      name: "_remix_session",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
   },
});

export const authenticator = new Authenticator<{ profile: Auth0Profile; accessToken: string }>(sessionStorage);

const auth0Strategy = new Auth0Strategy(
   {
      callbackURL: process.env.AUTH0_CALLBACK_URL!,
      clientID: process.env.AUTH0_CLIENT_ID!,
      audience: process.env.AUTH0_AUDIENCE!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      domain: process.env.AUTH0_DOMAIN!,
   },
   async ({ profile, accessToken }) => {
      // Get the user data from your DB or API using the tokens and profile
      return { profile, accessToken };
   }
);

authenticator.use(auth0Strategy);

export const { getSession, commitSession, destroySession } = sessionStorage;
