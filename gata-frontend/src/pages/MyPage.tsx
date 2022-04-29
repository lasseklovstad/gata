import { Typography } from "@mui/material";
import { useGetLoggedInUser } from "../api/user.api";
import { Loading } from "../components/Loading";
import { PageLayout } from "../components/PageLayout";
import { UserInfo } from "../components/UserInfo";
import { UserResponsibility } from "../components/UserResponsibilities";

export const MyPage = () => {
   const { userResponse } = useGetLoggedInUser();
   return (
      <>
         <PageLayout>
            <Typography variant="h1">Min side</Typography>
            <Loading response={userResponse} />
            {userResponse.data && <UserInfo user={userResponse.data} />}
            {userResponse.data && <UserResponsibility user={userResponse.data} />}
         </PageLayout>
      </>
   );
};
