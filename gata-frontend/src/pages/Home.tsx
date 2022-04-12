import {Container, Typography} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";

export const Home = ()=>{
    return <Container component={"main"}>
        <Toolbar/>
        <Typography variant={"h1"}>
            Hjem
        </Typography>
        <Typography variant={"body1"}>
            Dette en nettside for medlemer i gata. Logg deg inn for å se om du er medlem.
        </Typography>
    </Container>
}
