import { CircularProgress, ButtonProps, Button } from "@chakra-ui/react";
import { forwardRef } from "react";

import { ErrorAlert } from "./ErrorAlert";
import { UseClientState } from "../../utils/client.types";

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
   isLoading: boolean;
} & Omit<ButtonProps, "disabled">;

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(({ isLoading, ...buttonProps }, ref) => {
   return <Button isLoading={isLoading} ref={ref} {...buttonProps} />;
});
