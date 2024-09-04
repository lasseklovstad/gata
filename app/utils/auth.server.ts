import { createCookie, createCookieSessionStorage, redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import { TOTPStrategy } from "remix-auth-totp";

import type { ExternalUser } from "db/schema";
import {
   getExternalUserFromEmail,
   getExternalUserFromId,
   getNumberOfAdmins,
   getOptionalUserFromExternalUserId,
   insertOrUpdateExternalUser,
   insertUser,
} from "~/.server/db/user";
import { sendMail } from "~/.server/services/sendgrid";

import { env } from "./env.server";
import { RoleName } from "./roleUtils";
import { honeypot } from "./honeypot.server";

const userPreferences = createCookie("user_pref", { maxAge: 60 });

type CreateUser = {
   id: string;
   picture?: string;
   email: string;
   name: string;
};

const createOrUpdateUser = async ({ email, id, name, picture }: CreateUser) => {
   // TODO: Fix only update time and create only if not exist
   const [externalUser] = await insertOrUpdateExternalUser({
      email: email,
      id,
      name,
      picture,
   });
   if (env.MAKE_FIRST_USER_ADMIN === "true") {
      const [{ count }] = await getNumberOfAdmins();
      if (count === 0) {
         await insertUser(externalUser.id, RoleName.Admin);
      }
   }
   return externalUser;
};

const sessionStorage = createCookieSessionStorage({
   cookie: {
      name: "_remix_session",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      secrets: [env.AUTH0_COOKIE_SECRET!],
      maxAge: 60 * 60 * 24 * 400, // 400 days
   },
});

const authenticator = new Authenticator<ExternalUser>(sessionStorage, { throwOnError: true });

const totpStrategy = new TOTPStrategy(
   {
      secret: "928F416BAFC49B969E62052F00450B6E974B03E86DC6984D1FA787B7EA533227",
      magicLinkPath: "/magic-link",
      sendTOTP: async ({ email, code, magicLink, formData }) => {
         honeypot.check(formData);
         if (process.env.NODE_ENV === "development") {
            console.log("[Dev-Only] TOTP Code:", code);
         }
         await sendMail({
            html: `
      <h1>Gata Innlogging</h1>
      <p>Kode: ${code}</p>
      <a href="${magicLink}">Eller trykk her hvis du bruker safari eller android</a>
      `,
            to: [{ email }],
            subject: "Ny innlogging",
         });
      },
   },
   async ({ email }) => {
      let [user] = await getExternalUserFromEmail(email);

      if (!user) {
         user = await createOrUpdateUser({ email, id: `totp|${crypto.randomUUID()}`, name: email });
         if (!user) throw new Error("Whoops! Unable to create user.");
      }

      return user;
   }
);

const auth0Strategy = new Auth0Strategy(
   {
      callbackURL: "/callback",
      clientID: env.AUTH0_CLIENT_ID!,
      audience: env.AUTH0_AUDIENCE!,
      clientSecret: env.AUTH0_CLIENT_SECRET!,
      domain: env.AUTH0_DOMAIN!,
   },
   async ({ profile }) => {
      const id = profile.id;

      if (!id) {
         throw new Error("User id must exist");
      }

      let [user] = await getExternalUserFromId(id);

      if (!user) {
         const email = profile.emails ? profile.emails[0].value : undefined;
         const name = profile.displayName ?? email;
         if (!email || !name) {
            throw new Error("email must exist");
         }
         user = await createOrUpdateUser({
            email,
            id,
            name,
            picture: profile.photos ? profile.photos[0]?.value : undefined,
         });
         if (!user) throw new Error("Whoops! Unable to create user.");
      }

      return user;
   }
);

authenticator.use(auth0Strategy);

authenticator.use(totpStrategy);

export const createAuthenticator = () => {
   const { getSession, destroySession, commitSession } = sessionStorage;

   const getRequiredUser = async (request: Request) => {
      const auth = await authenticator.isAuthenticated(request);
      const url = new URL(request.url);
      const headers = {
         "Set-Cookie": await userPreferences.serialize({ loginPath: url.pathname }),
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
      const path = (await userPreferences.parse(cookieHeader))?.loginPath;
      return path;
   };

   return {
      getSession,
      destroySession,
      authenticator,
      getRequiredUser,
      getSessionLoginPath,
      commitSession,
   };
};
