import { Outlet, useParams } from "@remix-run/react";

import { TabNavLink } from "~/components/TabNavLink";

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
