import { CircularProgress, ButtonProps, Button } from "@chakra-ui/react";
import { forwardRef } from "react";

import { ErrorAlert } from "./ErrorAlert";
import { UseClientState } from "../api/client/client.types";

type LoadingProps = {
   response: UseClientState<unknown>;
   alertTitle?: string;
};

export const Loading = ({ response, alertTitle }: LoadingProps) => {
   return (
      <>
         {response.status === "loading" && <CircularProgress isIndeterminate />}
         <ErrorAlert response={response} alertTitle={alertTitle} />
      </>
   );
};

type LoadingButtonProps = {
   response?: UseClientState<unknown>;
} & Omit<ButtonProps, "disabled">;

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(({ response, ...buttonProps }, ref) => {
   return <Button isLoading={response?.status === "loading"} ref={ref} {...buttonProps} />;
});
