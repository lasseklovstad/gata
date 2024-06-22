import { Alert, AlertTitle } from "~/components/ui/alert";

type Props = {
   isActive: boolean;
   id: string;
};

export const PollActiveStatus = ({ isActive, id }: Props) => {
   return (
      <>
         {!isActive ? (
            <Alert className="my-2" variant="warning" id={id}>
               <AlertTitle>Avstemningen er avsluttet</AlertTitle>
            </Alert>
         ) : (
            <div />
         )}
      </>
   );
};
