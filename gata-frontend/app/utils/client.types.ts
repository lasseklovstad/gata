type RequestBodyBase = unknown;

export type ClientConfigType<RequestBody extends RequestBodyBase> = {
   body?: RequestBody;
   headers?: HeadersInit;
   signal?: Request["signal"];
   method?: Request["method"];
   token?: string;
   baseUrl: string;
};
