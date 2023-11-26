import { Box, Button, Text } from "@chakra-ui/react";
import { ActionFunction, useFetcher } from "react-router-dom";

import { client } from "../../../api/client/client";
import { getRequiredAccessToken } from "../../../auth0Client";
import { IGataUser } from "../../../types/GataUser.type";

export const userSubscribeAction: ActionFunction = async ({ params }) => {
   const token = await getRequiredAccessToken();
   await client(`user/${params.memberId}/subscribe`, {
      method: "PUT",
      token,
   });
   return {};
};

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
