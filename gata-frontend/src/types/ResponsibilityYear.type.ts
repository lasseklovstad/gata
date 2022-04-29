import { IGataUser } from "./GataUser.type";
import { IResponsibility } from "./Responsibility.type";
import { IResponsibilityNote } from "./ResponsibilityNote.type";

export interface IResponsibilityYear {
   id: string;
   year: number;
   user: IResponsibilityYearUser;
   responsibility: IResponsibility;
   note: IResponsibilityNote;
}

export type IResponsibilityYearUser = Pick<IGataUser, "id" | "name">;

export interface IResponsibilityYearPayload {
   responsibilityId: string;
   year: number;
}

export interface IResponsibilityNotePayload {
   text: string;
}
