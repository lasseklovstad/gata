import {useClient} from "./client/useClient";
import {useEffect} from "react";

interface IUser {
    email: string
    name: string
    user_id: string
}

export const useGetUsers = () => {
    const [usersResponse, fetchUsers] = useClient<IUser[], never>()
    useEffect(()=>{
        fetchUsers("user")
    },[fetchUsers])

    return {usersResponse}
}
