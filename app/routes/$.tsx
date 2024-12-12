import { Link } from "react-router";

import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";

export default function NotFound() {
   return (
      <PageLayout>
         <Typography>Du er på en side som ikke eksisterer</Typography>
         <Button as={Link} to="/">
            Gå hjem
         </Button>
      </PageLayout>
   );
}
