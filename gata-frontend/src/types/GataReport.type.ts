import { Descendant } from "slate";

export interface IGataReport {
   id: string;
   title: string;
   description: string;
   createdDate: string;
   lastModifiedDate: string;
   lastModifiedBy: string;
   content: string | null;
}

export interface IGataReportPayload {
   title: string;
   description: string;
}
