/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Link, NavLink, useNavigation } from "@remix-run/react";
import { Menu } from "lucide-react";
import { useEffect, useRef } from "react";

import { useDialog } from "~/utils/dialogUtils";

import { Button } from "../ui/button";

type Props = {
   items: { name: string; url?: string }[];
};

export const SideBar = ({ items }: Props) => {
   const navigation = useNavigation();
   const dialog = useDialog({ defaultOpen: false });
   const close = dialog.close;
   useEffect(() => {
      if (navigation.state === "loading") {
         close();
      }
   }, [navigation.state, close]);

   return (
      <>
         <Button onClick={dialog.open} type="button" size="icon">
            <span className="sr-only">Åpne meny</span>
            <Menu />
         </Button>

         <dialog
            ref={dialog.dialogRef}
            className={`fixed top-0 left-0 w-60 h-screen m-0 p-0 max-h-full backdrop:bg-black backdrop:opacity-50  transform transition-transform duration-100 animate-slideInLeft`}
            aria-label="Sidemeny"
            onClick={(e) => {
               if (!dialog.dialogRef.current) return;
               const dialogDimensions = dialog.dialogRef.current.getBoundingClientRect();
               if (
                  e.clientX < dialogDimensions.left ||
                  e.clientX > dialogDimensions.right ||
                  e.clientY < dialogDimensions.top ||
                  e.clientY > dialogDimensions.bottom
               ) {
                  dialog.close();
               }
            }}
         >
            <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50">
               <ul className="divide-y">
                  {items.map((item, index) => {
                     return (
                        <li key={index} className="py-2 flex">
                           {item.url ? (
                              item.url.startsWith("https") ? (
                                 <a href={item.url} target="_blank" rel="noreferrer" className="w-full">
                                    {item.name}
                                 </a>
                              ) : (
                                 <NavLink
                                    to={item.url}
                                    className={({ isActive }) => `w-full ${isActive ? "font-semibold" : ""}`}
                                 >
                                    {item.name}
                                 </NavLink>
                              )
                           ) : (
                              item.name
                           )}
                        </li>
                     );
                  })}
               </ul>
            </div>
         </dialog>
      </>
   );
};
