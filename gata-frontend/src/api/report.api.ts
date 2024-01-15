import { useEffect } from "react";
import { Descendant } from "slate";

import { useClient } from "./client/useClient";
import { IGataReport } from "../types/GataReport.type";
import { client } from "./client/client";

export const useGetReportEmails = () => {
   const [emailsResponse, clientFetch] = useClient<string[], never>();

   useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      clientFetch(`report/publishemails`);
   }, [clientFetch]);

   return { emailsResponse };
};

export const usePublishReport = (id: string) => {
   const [publishResponse, clientFetch] = useClient<string[], never>();

   const publishReport = () => {
      return clientFetch(`report/${id}/publish`);
   };

   return { publishResponse, publishReport };
};

export const usePutGataReportContent = (id: string) => {
   const [putReportResponse, clientFetch] = useClient<IGataReport, Descendant[]>();

   const putReportContent = (body: Descendant[]) => {
      return clientFetch(`report/${id}/content`, { method: "PUT", body });
   };

   return { putReportResponse, putReportContent };
};

export const putReportMarkdownContent = (reportId: string, markdown: string, token: string) => {
   return client(`report/${reportId}/markdown`, { method: "PUT", body: { markdown }, token });
};
