import { useFetcher } from "@remix-run/react";

import type { User } from "~/.server/db/user";
import { Button } from "~/components/ui/button";
import type { IGataRole } from "~/types/GataRole.type";

import { memberIntent } from "../intent";

type Props = {
   role: IGataRole;
   user: User;
};

export const RoleButton = ({ role, user }: Props) => {
   const hasRole = !!user.roles.find((r) => r.roleId === role.id);
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
