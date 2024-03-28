import { createContext } from "react";

interface ServerStyleContextData {
   key: string;
   ids: Array<string>;
   css: string | boolean;
}

export const ServerStyleContext = createContext<ServerStyleContextData[] | null>(null);

interface ClientStyleContextData {
   reset: () => void;
}

export const ClientStyleContext = createContext<ClientStyleContextData | null>(null);
