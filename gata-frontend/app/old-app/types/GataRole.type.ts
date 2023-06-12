export type GataRoleType = "Administrator" | "Medlem";

export interface IGataRole {
   id: string;
   name: GataRoleType;
}
