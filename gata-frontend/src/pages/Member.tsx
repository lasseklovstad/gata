import {Alert, AlertTitle, CircularProgress, List, ListItem, ListItemText, Typography} from "@mui/material";
import {useGetUsers} from "../api/user.api";

export const Member = ()=>{
    const {usersResponse} = useGetUsers()
    return <>
        <Typography variant={"h1"} id={"member-title"}>
            Medlemmer
        </Typography>
        {usersResponse.status === "loading" && <CircularProgress/>}
        {usersResponse.status === "error" && <Alert severity={"error"}>
            <AlertTitle>Det oppstod en feil ved henting av medlemer</AlertTitle>
            {usersResponse.error?.message}
        </Alert>}
        <List aria-labelledby={"member-title"}>
            {usersResponse.data?.map((user)=>{
                return <ListItem key={user.user_id} >
                    <ListItemText primary={user.name} secondary={user.email} />
                </ListItem>
            })}
        </List>
    </>
}
