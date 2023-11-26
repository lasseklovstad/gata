import { ISimpleGataUser } from "./GataUser.type";
import { IResponsibility } from "./Responsibility.type";
import { IResponsibilityNote } from "./ResponsibilityNote.type";

export interface IResponsibilityYear {
   id: string;
   year: number;
   user: ISimpleGataUser;
   responsibility: IResponsibility;
   note: IResponsibilityNote;
}
