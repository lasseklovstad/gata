import { Alert, AlertTitle } from "~/components/ui/alert";

type Props = {
   isActive: boolean;
};

export const PollActiveStatus = ({ isActive }: Props) => {
   return (
      <>
         {!isActive ? (
            <Alert className="my-2" variant="warning">
               <AlertTitle>Avstemningen er avsluttet</AlertTitle>
            </Alert>
         ) : (
            <div />
         )}
      </>
   );
};
