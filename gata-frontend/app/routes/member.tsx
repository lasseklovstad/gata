import { Box, Tab, TabList, Tabs } from "@chakra-ui/react";
import { Link, Outlet, useMatch, useParams } from "@remix-run/react";

export default function MemberLayout() {
   const { memberId } = useParams();
   const matchesResponsibility = useMatch("/member/:memberId/responsibility/*");
   const matchesOverView = useMatch("/member/:memberId/overview/*");

   const getIndex = () => {
      if (matchesResponsibility) {
         return 1;
      }
      if (matchesOverView) {
         return 2;
      }
      return 0;
   };

   return (
      <Tabs px={0} index={getIndex()}>
         <TabList>
            <Tab as={Link} to={memberId}>
               Info
            </Tab>
            <Tab as={Link} to={`${memberId}/responsibility`}>
               Ansvarsposter
            </Tab>
            <Tab as={Link} to={`${memberId}/overview`}>
               Oversikt
            </Tab>
         </TabList>
         <Box pt={2}>
            <Outlet />
         </Box>
      </Tabs>
   );
}
