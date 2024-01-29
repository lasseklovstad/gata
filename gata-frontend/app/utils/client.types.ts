type RequestBodyBase = unknown;

export type ClientConfigType<RequestBody extends RequestBodyBase> = {
   body?: RequestBody;
   headers?: HeadersInit;
   signal?: Request["signal"];
   method?: Request["method"];
   token?: string;
};

type UseClientStatus = "idle" | "loading" | "error" | "success";
type UseClientError = {
   message: string;
};
export type UseClientState<ResponseBody> = {
   data?: ResponseBody;
   status: UseClientStatus;
   error?: UseClientError;
};
