import { CircularProgress, ButtonProps, Button } from "@mui/material";
import { UseClientState } from "../api/client/client.types";
import { ErrorAlert } from "./ErrorAlert";

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

export const LoadingButton = ({ response, startIcon, ...buttonProps }: LoadingButtonProps) => {
   return (
      <Button
         disabled={response?.status === "loading"}
         startIcon={response?.status === "loading" ? <CircularProgress size={20} /> : startIcon}
         {...buttonProps}
      />
   );
};
