import {useClient} from "./client/useClient";
import {useEffect} from "react";
import {IAuth0User} from "../types/Auth0User.type";



export const useGetUsers = () => {
    const [usersResponse, fetchUsers] = useClient<IAuth0User[], never>()
    useEffect(()=>{
        fetchUsers("user")
    },[fetchUsers])

    return {usersResponse}
}
