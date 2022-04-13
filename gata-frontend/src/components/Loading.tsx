import { CircularProgress, Alert, AlertTitle } from "@mui/material";
import { UseClientState } from "../api/client/client.types";

type LoadingProps = {
   response: UseClientState<unknown>;
   alertTitle?: string;
};

export const Loading = ({ response, alertTitle = "Det oppstod en feil" }: LoadingProps) => {
   return (
      <>
         {response.status === "loading" && <CircularProgress />}
         {response.status === "error" && (
            <Alert severity="error">
               <AlertTitle>{alertTitle}</AlertTitle>
               {response.error?.message}
            </Alert>
         )}
      </>
   );
};
