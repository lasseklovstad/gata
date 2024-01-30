import { Box, Button, Text } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";

import type { IGataUser } from "../../../types/GataUser.type";

interface UserSubscribeProps {
   user: IGataUser;
}

export const UserSubscribe = ({ user }: UserSubscribeProps) => {
   const fetcher = useFetcher();

   return (
      <Box>
         <Text>{!user?.subscribe && "Du kan få tilsendt notifikasjon på epost. "}</Text>
         <fetcher.Form action="subscribe" method="put">
            <input hidden name="userId" defaultValue={user.id} />
            <Button isLoading={fetcher.state !== "idle"} variant="outline" type="submit">
               {user.subscribe ? "Avslutt abonnering" : "Abonner på oppdateringer"}
            </Button>
         </fetcher.Form>
      </Box>
   );
};
