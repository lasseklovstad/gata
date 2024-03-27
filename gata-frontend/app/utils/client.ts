import type { ClientConfigType } from "./client.types";

export const client = <ResponseBody = unknown, RequestBody = unknown>(
   url: string,
   { body, token, baseUrl, ...customConfig }: ClientConfigType<RequestBody>
): Promise<ResponseBody> => {
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

   const urlFinal = `${baseUrl}/api/${url}`;

   return fetch(urlFinal, config).then(async (response) => {
      if (response.ok) {
         return getResponseBody<ResponseBody>(response);
      } else {
         const error = await getResponseBody<{ message: string }>(response);
         throw new Error(error.message);
      }
   });
};

async function getResponseBody<ResponseBody>(response: Response) {
   if (response.status === 204) {
      // No content
      return undefined as ResponseBody;
   } else if (response.headers.get("Content-Type") === "application/json") {
      return (await response.json()) as ResponseBody;
   } else if (response.headers.get("Content-Type")?.includes("text/plain")) {
      return (await response.text()) as ResponseBody;
   }
   return undefined as ResponseBody;
}
