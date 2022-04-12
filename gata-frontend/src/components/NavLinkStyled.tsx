import {NavLink} from "react-router-dom";
import {forwardRef} from "react";

export const NavLinkStyled = forwardRef((props: any, ref) => {
    return <NavLink
        {...props}
        ref={ref}
        className={({isActive}) => isActive ? `${props.className} Mui-selected` : props.className}/>
})
