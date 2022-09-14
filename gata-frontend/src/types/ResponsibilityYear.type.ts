import { IResponsibility } from "./Responsibility.type";
import { IResponsibilityNote } from "./ResponsibilityNote.type";
import { ISimpleGataUser } from "./GataUser.type";

export interface IResponsibilityYear {
   id: string;
   year: number;
   user: ISimpleGataUser;
   responsibility: IResponsibility;
   note: IResponsibilityNote;
}

export interface IResponsibilityYearPayload {
   responsibilityId: string;
   year: number;
}

export interface IResponsibilityNotePayload {
   text: string;
}
