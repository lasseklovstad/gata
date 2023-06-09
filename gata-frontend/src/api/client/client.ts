import { ClientConfigType, RequestBodyBase } from "./client.types";
import { DefaultResponseTypes } from "./useClient";

export const client = <ResponseBody extends DefaultResponseTypes, RequestBody extends RequestBodyBase>(
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
      config.body = typeof body !== "string" ? JSON.stringify(body) : body;
   }

   return window.fetch(`/api/${url}`, config).then(async (response) => {
      if (response.ok) {
         if (response.status === 204) {
            // No content
            return undefined;
         } else if (response.headers.get("Content-Type") === "application/json") {
            return (await response.json()) as ResponseBody;
         } else if (response.headers.get("Content-Type")?.includes("text/plain")) {
            return (await response.text()) as ResponseBody;
         }
      } else {
         if (response.status === 401) {
            return Promise.reject(new Error("Du er ikke logget in"));
         }
         if (response.status === 403) {
            return Promise.reject(new Error("Du har ikke tilgang"));
         }
         const errorMessage = await response.json();
         return Promise.reject(new Error(errorMessage.message));
      }
   });
};
