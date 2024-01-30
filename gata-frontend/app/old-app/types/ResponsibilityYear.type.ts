import type { ISimpleGataUser } from "./GataUser.type";
import type { IResponsibility } from "./Responsibility.type";
import type { IResponsibilityNote } from "./ResponsibilityNote.type";

export interface IResponsibilityYear {
   id: string;
   year: number;
   user: ISimpleGataUser;
   responsibility: IResponsibility;
   note: IResponsibilityNote;
}
