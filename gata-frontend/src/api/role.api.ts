import {useClient} from "./client/useClient";
import {useEffect} from "react";
import {IAuth0Role} from "../types/Auth0Role.type";
import {IAuth0User} from "../types/Auth0User.type";

export const useGetRoles = () => {
    const [rolesResponse, clientFetch] = useClient<IAuth0Role[], never>()
    useEffect(() => {
        clientFetch("role")
    }, [clientFetch])

    return {rolesResponse}
}

export const useGetUsersFromRole = (roleId: string) => {
    const [usersResponse, clientFetch] = useClient<IAuth0User[], never>()
    useEffect(() => {
        clientFetch(`role/${roleId}/users`)
    }, [clientFetch, roleId])

    return {usersResponse}
}
