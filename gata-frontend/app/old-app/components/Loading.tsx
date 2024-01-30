import { Button, ButtonProps } from "@chakra-ui/react";
import { forwardRef } from "react";

type LoadingButtonProps = {
   isLoading: boolean;
} & Omit<ButtonProps, "disabled">;

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(({ isLoading, ...buttonProps }, ref) => {
   return <Button isLoading={isLoading} ref={ref} {...buttonProps} />;
});
