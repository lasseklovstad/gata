import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Outlet, useParams } from "react-router";

import { getUser } from "~/.server/db/user";
import { TabNavLink } from "~/components/TabNavLink";
import { createAuthenticator } from "~/utils/auth.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
   return [{ title: `${data?.member.name} - Gata` }];
};

export const loader = async ({ request, params: { memberId } }: LoaderFunctionArgs) => {
   await createAuthenticator().getRequiredUser(request);

   if (!memberId) throw new Error("Member id required");

   const [member] = await Promise.all([getUser(memberId)]);
   return { member };
};

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
