import { useGetLoggedInUser } from "../api/user.api";

export const useRoles = () => {
   const { userResponse } = useGetLoggedInUser();
   const isAdmin = !!userResponse.data?.isUserAdmin;
   const isMember = !!userResponse.data?.isUserMember;

   return { isAdmin, isMember, user: userResponse.data };
};
