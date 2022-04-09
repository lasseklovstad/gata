import {useClient} from "./client/useClient";

export const useGetRole = () => {
    const [rolesResponse, fetchRoles] = useClient()
    const getRoles = () => {
        return fetchRoles("role")
    }

    return {rolesResponse, getRoles}
}
