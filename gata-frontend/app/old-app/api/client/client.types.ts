export type RequestBodyBase = any;

export type ClientConfigType<RequestBody extends RequestBodyBase> = {
   body?: RequestBody;
   headers?: HeadersInit;
   signal?: Request["signal"];
   method?: Request["method"];
   token?: string;
};

export type UseClientStatus = "idle" | "loading" | "error" | "success";
export type UseClientError = {
   message: string;
};
export type UseClientState<ResponseBody extends unknown> = {
   data?: ResponseBody;
   status: UseClientStatus;
   error?: UseClientError;
};
