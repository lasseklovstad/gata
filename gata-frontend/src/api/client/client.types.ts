export type RequestBodyBase = unknown;

export type ClientConfigType<RequestBody extends RequestBodyBase> = {
   body?: RequestBody;
   headers?: HeadersInit;
   signal?: AbortSignal;
   method?: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
   token?: string;
};

export type UseClientStatus = "idle" | "loading" | "error" | "success";
export type UseClientError = {
   message: string;
};
export type UseClientState<ResponseBody> = {
   data?: ResponseBody;
   status: UseClientStatus;
   error?: UseClientError;
};
