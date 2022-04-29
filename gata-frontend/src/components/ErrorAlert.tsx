import { Alert, AlertTitle } from "@mui/material";
import { UseClientState } from "../api/client/client.types";

type ErrorAlertProps = {
   response: UseClientState<unknown>;
   alertTitle?: string;
};

export const ErrorAlert = ({ response, alertTitle = "Det oppstod en feil" }: ErrorAlertProps) => {
   return (
      <>
         {response.status === "error" && (
            <Alert severity="error">
               <AlertTitle>{alertTitle}</AlertTitle>
               {response.error?.message}
            </Alert>
         )}
      </>
   );
};
