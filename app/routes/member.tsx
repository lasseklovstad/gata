import { NavLink, Outlet, useParams } from "@remix-run/react";
import type { ComponentProps } from "react";

export default function MemberLayout() {
   const { memberId } = useParams();

   return (
      <>
         <nav className="border-b-2">
            <ul className="flex">
               <li>
                  <TabNavLink to={memberId ?? ""}>Info</TabNavLink>
               </li>
               <li>
                  <TabNavLink to={`${memberId}/responsibility`}>Ansvarsposter</TabNavLink>
               </li>
               <li>
                  <TabNavLink to={`${memberId}/overview`}>Oversikt</TabNavLink>
               </li>
            </ul>
         </nav>
         <div className="my-4">
            <Outlet />
         </div>
      </>
   );
}

const TabNavLink = (props: ComponentProps<typeof NavLink>) => {
   return (
      <NavLink
         {...props}
         end
         unstable_viewTransition
         className="-mb-[2px] block p-2 aria-current:text-primary aria-current:border-b-2 border-primary"
      />
   );
};
