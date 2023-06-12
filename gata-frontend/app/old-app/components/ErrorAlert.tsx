import { Alert, AlertDescription, AlertIcon, AlertTitle, Box } from "@chakra-ui/react";
import { UseClientState } from "../api/client/client.types";

type ErrorAlertProps = {
   response: UseClientState<unknown>;
   alertTitle?: string;
};

export const ErrorAlert = ({ response, alertTitle = "Det oppstod en feil" }: ErrorAlertProps) => {
   return (
      <>
         {response.status === "error" && (
            <Alert status="error">
               <AlertIcon />
               <Box>
                  <AlertTitle>{alertTitle}</AlertTitle>
                  <AlertDescription>{response.error?.message}</AlertDescription>
               </Box>
            </Alert>
         )}
      </>
   );
};
