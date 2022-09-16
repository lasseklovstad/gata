import { Typography } from "@mui/material";
import { useGetLoggedInUser, useUpdateSubscribe } from "../api/user.api";
import { Loading, LoadingButton } from "../components/Loading";
import { PageLayout } from "../components/PageLayout";
import { UserInfo } from "../components/UserInfo";
import { UserResponsibility } from "../components/UserResponsibilities";
import { useEffect, useState } from "react";
import { IGataUser } from "../types/GataUser.type";
import { ErrorAlert } from "../components/ErrorAlert";

export const MyPage = () => {
   const { userResponse, updateUser } = useGetLoggedInUser();
   const [user, setUser] = useState<IGataUser>();
   const { updateSubrscribe, updateSubrscribeResponse } = useUpdateSubscribe();

   useEffect(() => {
      setUser(userResponse.data);
   }, [userResponse.data]);

   const handleSubscribe = (userId: string) => async () => {
      const { data } = await updateSubrscribe(userId);
      data && setUser(data);
   };
   return (
      <>
         <PageLayout>
            <Typography variant="h1">Min side</Typography>
            <Typography>{!user?.subscribe && "Du kan få tilsendt notifikasjon på epost. "}</Typography>
            {userResponse.data && (
               <LoadingButton
                  response={updateSubrscribeResponse}
                  variant="outlined"
                  onClick={handleSubscribe(userResponse.data.id)}
               >
                  {user?.subscribe ? "Avslutt abonnering" : "Abonner på oppdateringer"}
               </LoadingButton>
            )}
            <ErrorAlert response={updateSubrscribeResponse} />
            <Loading response={userResponse} />
            {userResponse.data && <UserInfo user={userResponse.data} onChange={updateUser} />}
            {userResponse.data && <UserResponsibility user={userResponse.data} />}
         </PageLayout>
      </>
   );
};
