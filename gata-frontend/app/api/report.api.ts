import type { IGataReport, IGataReportSimple } from "~/types/GataReport.type";
import type { Page } from "~/types/Page.type";
import { client } from "~/utils/client";

import type { RequestOptions } from "./requestOptions";

export const getReportsSimple = (options: RequestOptions) => {
   return client<Page<IGataReportSimple>>(`report/simple?page=0&type=DOCUMENT`, options);
};

export const getReport = ({ reportId, ...options }: RequestOptions & { reportId: string | undefined }) => {
   return client<IGataReport>(`report/${reportId}`, options);
};
