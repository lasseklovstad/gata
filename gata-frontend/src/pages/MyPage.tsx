import { useGetLoggedInUser, useUpdateSubscribe } from "../api/user.api";
import { Loading, LoadingButton } from "../components/Loading";
import { PageLayout } from "../components/PageLayout";
import { UserInfo } from "../components/UserInfo";
import { UserResponsibility } from "../components/UserResponsibilities";
import { useEffect, useState } from "react";
import { IGataUser } from "../types/GataUser.type";
import { ErrorAlert } from "../components/ErrorAlert";
import { Heading, Text } from "@chakra-ui/react";

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
            <Heading as="h1">Min side</Heading>
            <Text>{!user?.subscribe && "Du kan få tilsendt notifikasjon på epost. "}</Text>
            {userResponse.data && (
               <LoadingButton
                  response={updateSubrscribeResponse}
                  variant="outline"
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
