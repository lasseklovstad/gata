import { useCallback, useEffect } from "react";
import { Descendant } from "slate";
import { IGataReport, IGataReportPayload } from "../types/GataReport.type";
import { useClient } from "./client/useClient";

export const useGetGataReports = () => {
   const [reportResponse, clientFetch] = useClient<IGataReport[], never>();

   useEffect(() => {
      clientFetch("report");
   }, [clientFetch]);

   return { reportResponse };
};

export const useGetGataReport = (id: string) => {
   const [reportResponse, clientFetch] = useClient<IGataReport, never>();

   const getReport = useCallback(() => {
      return clientFetch(`report/${id}`);
   }, [clientFetch, id]);

   useEffect(() => {
      getReport();
   }, [getReport]);

   return { reportResponse, getReport };
};

export const useSaveGataReport = () => {
   const [saveResponse, clientFetch] = useClient<IGataReport, IGataReportPayload>();

   const putReport = (id: string, body: IGataReportPayload) => {
      return clientFetch(`report/${id}`, { method: "PUT", body });
   };

   const postReport = (body: IGataReportPayload) => {
      return clientFetch("report", { method: "POST", body });
   };

   const deleteReport = (id: string) => {
      return clientFetch(`report/${id}`, { method: "DELETE" });
   };

   return { saveResponse, putReport, postReport, deleteReport };
};

export const usePutGataReportContent = (id: string) => {
   const [putReportResponse, clientFetch] = useClient<IGataReport, Descendant[]>();

   const putReportContent = (body: Descendant[]) => {
      return clientFetch(`report/${id}/content`, { method: "PUT", body });
   };

   return { putReportResponse, putReportContent };
};
