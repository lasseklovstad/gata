import { NavLink } from "@remix-run/react";
import type { ComponentProps } from "react";

export const TabNavLink = (props: ComponentProps<typeof NavLink>) => {
   return (
      <NavLink
         {...props}
         end
         unstable_viewTransition
         className="-mb-[2px] block p-2 aria-current:text-primary aria-current:border-b-2 border-primary"
      />
   );
};
