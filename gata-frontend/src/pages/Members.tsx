import {
    Alert,
    AlertTitle, Avatar,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from "@mui/material";
import {useGetRoles, useGetUsersFromRole} from "../api/role.api";

type MembersProps = {
    roleId: string
    name: string
}

const Members = ({roleId, name}:MembersProps)=>{
    const {usersResponse} = useGetUsersFromRole(roleId)
    return <>
        <Typography variant={"h2"} id={"member-title"}>
            {name}
        </Typography>
        {usersResponse.status === "loading" && <CircularProgress/>}
        {usersResponse.status === "error" && <Alert severity={"error"}>
            <AlertTitle>Det oppstod en feil ved henting av medlemer</AlertTitle>
            {usersResponse.error?.message}
        </Alert>}
        <List aria-labelledby={"member-title"}>
            {usersResponse.data?.map((user)=>{
                return <ListItem key={user.user_id} divider>
                    <ListItemIcon>
                        <Avatar src={user.picture}/>
                    </ListItemIcon>
                    <ListItemText primary={user.name} secondary={user.email} />

                </ListItem>
            })}
        </List>
    </>
}

export const MemberPage = ()=>{
    const {rolesResponse} = useGetRoles()
    return <>
        <Typography variant={"h1"} id={"role-title"}>
            Medlemer
        </Typography>
        {rolesResponse.status === "loading" && <CircularProgress/>}
        {rolesResponse.status === "error" && <Alert severity={"error"}>
            <AlertTitle>Det oppstod en feil ved henting av roller</AlertTitle>
            {rolesResponse.error?.message}
        </Alert>}
        {rolesResponse.data?.map((role)=>{
            return <Members key={role.id} roleId={role.id} name={role.name}/>
        })}
    </>
}
