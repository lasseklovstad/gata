import { ClientConfigType, RequestBodyBase } from "./client.types";

export const client = <ResponseBody extends unknown, RequestBody extends RequestBodyBase>(
   url: string,
   { body, token, ...customConfig } = {} as ClientConfigType<RequestBody>
) => {
   const headers: HeadersInit = { "content-type": "application/json" };
   if (token) {
      headers.Authorization = `Bearer ${token}`;
   }
   const config: RequestInit = {
      method: body ? "POST" : "GET",
      ...customConfig,
      headers: {
         ...headers,
         ...customConfig.headers,
      },
   };
   if (body) {
      config.body = JSON.stringify(body);
   }

   return window.fetch(`/api/${url}`, config).then(async (response) => {
      if (response.ok) {
         if (response.status === 204) {
            // No content
            return undefined;
         } else {
            return (await response.json()) as ResponseBody;
         }
      } else {
         const errorMessage = await response.text();
         if (response.status === 401) {
            return Promise.reject(new Error("Du er ikke logget in"));
         }
         if (response.status === 403) {
            return Promise.reject(new Error("Du har ikke tilgang"));
         }
         return Promise.reject(new Error(errorMessage));
      }
   });
};
