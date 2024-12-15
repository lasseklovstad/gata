import { Outlet } from "react-router";

import { getUser } from "~/.server/db/user";
import { TabNavLink } from "~/components/TabNavLink";
import { getRequiredUser } from "~/utils/auth.server";

import type { Route } from "./+types/member";

export const meta = ({ data }: Route.MetaArgs) => {
   return [{ title: `${data.member.name} - Gata` }];
};

export const loader = async ({ request, params: { memberId } }: Route.LoaderArgs) => {
   await getRequiredUser(request);

   if (!memberId) throw new Response("Member id required", { status: 400 });

   const [member] = await Promise.all([getUser(memberId)]);
   return { member };
};

export default function MemberLayout({ params: { memberId } }: Route.ComponentProps) {
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
