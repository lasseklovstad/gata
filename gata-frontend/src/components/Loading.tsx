import { CircularProgress, ButtonProps, Button } from "@mui/material";
import { UseClientState } from "../api/client/client.types";
import { ErrorAlert } from "./ErrorAlert";
import { forwardRef } from "react";

type LoadingProps = {
   response: UseClientState<unknown>;
   alertTitle?: string;
};

export const Loading = ({ response, alertTitle }: LoadingProps) => {
   return (
      <>
         {response.status === "loading" && <CircularProgress />}
         <ErrorAlert response={response} alertTitle={alertTitle} />
      </>
   );
};

type LoadingButtonProps = {
   response?: UseClientState<unknown>;
} & Omit<ButtonProps, "disabled">;

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
   ({ response, startIcon, ...buttonProps }, ref) => {
      return (
         <Button
            disabled={response?.status === "loading"}
            startIcon={response?.status === "loading" ? <CircularProgress size={20} /> : startIcon}
            ref={ref}
            {...buttonProps}
         />
      );
   }
);
