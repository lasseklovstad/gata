import { useFetcher } from "@remix-run/react";

import type { User } from "~/.server/db/user";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";

import { memberIntent } from "../intent";

interface UserSubscribeProps {
   user: User;
}

export const UserSubscribe = ({ user }: UserSubscribeProps) => {
   const fetcher = useFetcher();

   return (
      <div>
         <Typography>{!user?.subscribe && "Du kan få tilsendt notifikasjon på epost. "}</Typography>
         <fetcher.Form method="PUT">
            <input hidden name="userId" defaultValue={user.id} />
            <Button
               isLoading={fetcher.state !== "idle"}
               variant="outline"
               type="submit"
               name="intent"
               value={memberIntent.updateSubscribe}
            >
               {user.subscribe ? "Avslutt abonnering" : "Abonner på oppdateringer"}
            </Button>
         </fetcher.Form>
      </div>
   );
};
