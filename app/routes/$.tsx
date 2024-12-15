import { Link } from "react-router";

import { PageLayout } from "~/components/PageLayout";
import { Button } from "~/components/ui/button";
import { Typography } from "~/components/ui/typography";

export default function NotFound() {
   return (
      <PageLayout>
         <Typography>Du har kommet til en side som ikke er i bruk</Typography>
         <Button as={Link} to="/">
            Gå hjem
         </Button>
      </PageLayout>
   );
}
