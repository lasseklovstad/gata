import { Button } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";

import type { IGataRole } from "~/types/GataRole.type";
import type { IGataUser } from "~/types/GataUser.type";

import { memberIntent } from "../intent";

type Props = {
   role: IGataRole;
   user: IGataUser;
};

export const RoleButton = ({ role, user }: Props) => {
   const hasRole = !!user.roles.find((r) => r.name === role.name);
   const fetcher = useFetcher();
   return (
      <fetcher.Form method={hasRole ? "DELETE" : "POST"}>
         <input readOnly hidden value={role.id} name="roleId" />
         <Button
            variant="outline"
            type="submit"
            isLoading={fetcher.state !== "idle"}
            name="intent"
            value={memberIntent.updateRole}
         >
            {hasRole ? "Fjern rolle" : "Legg til rolle"}
         </Button>
      </fetcher.Form>
   );
};
