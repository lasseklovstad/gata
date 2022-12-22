import { Auth0Client } from "@auth0/auth0-spa-js";

const auth0Client = new Auth0Client({
   clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
   domain: import.meta.env.VITE_AUTH0_DOMAIN,
   authorizationParams: {
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      redirect_uri: window.location.origin + "/callback",
   },
});

export const getAccessToken = async () => {
   await auth0Client.checkSession();
   return auth0Client.getTokenSilently();
};
export const getIsAuthenticated = async () => {
   await auth0Client.checkSession();
   return auth0Client.isAuthenticated();
};

export const handleRedirectCallback = () => {
   return auth0Client.handleRedirectCallback();
};

export const getUser = async () => {
   await auth0Client.checkSession();
   return auth0Client.getUser();
};

export const getRequiredAccessToken = async () => {
   await auth0Client.checkSession();
   const token = await auth0Client.getTokenSilently();
   if (!token) {
      throw new Response("", { status: 401 });
   }
   return token;
};

export const logout = () => {
   return auth0Client.logout({ logoutParams: { returnTo: window.location.origin } });
};

export const loginWithRedirect = () => {
   return auth0Client.loginWithRedirect();
};
