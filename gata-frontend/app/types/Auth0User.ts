import type { Auth0Profile } from "remix-auth-auth0";

export type Auth0User = { profile: Auth0Profile; accessToken: string };
