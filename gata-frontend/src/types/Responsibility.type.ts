import { IGataUser } from "./GataUser.type";

export type Responsibility = {
   id: string;
   name: string;
   description: string;
   user: Pick<IGataUser, "id" | "name"> | null;
};
