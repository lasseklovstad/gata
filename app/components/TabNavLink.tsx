import type { ComponentProps } from "react";
import { NavLink } from "react-router";

export const TabNavLink = (props: ComponentProps<typeof NavLink>) => {
   return (
      <NavLink
         {...props}
         end
         preventScrollReset
         className="-mb-[2px] block p-2 aria-current:text-primary aria-current:border-b-2 border-primary"
      />
   );
};
