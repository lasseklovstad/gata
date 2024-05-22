import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { components } from "react-select";
import type Select from "react-select";
import type { ClassNamesConfig, GroupBase, SelectComponentsConfig, StylesConfig } from "react-select";

import { cn } from "~/utils";

type Option = {
   label: string;
   value: string;
   icon: ReactNode;
   isFixed?: boolean;
};

export const getSelectDefaultProps = <IsMulti extends boolean>() => {
   const customComponents = {
      Option: ({ children, ...props }) => (
         <components.Option {...props}>
            <div className="flex gap-2 items-center">
               {props.data.icon} {children}
            </div>
         </components.Option>
      ),
      SingleValue: ({ children, ...props }) => (
         <components.SingleValue {...props}>
            <div className="flex gap-2 items-center">
               {props.data.icon} {children}
            </div>
         </components.SingleValue>
      ),
      MultiValue: ({ children, ...props }) => (
         <components.MultiValue {...props}>
            <div className="flex gap-2 items-center">
               {props.data.icon} {children}
            </div>
         </components.MultiValue>
      ),
      MultiValueRemove: (props) => (
         <components.MultiValueRemove
            {...props}
            innerProps={{
               ...props.innerProps,
               "aria-label": `Fjern ${props.data.label}`,
            }}
         >
            <X />
         </components.MultiValueRemove>
      ),
   } satisfies SelectComponentsConfig<Option, IsMulti, GroupBase<Option>>;

   const styles = {
      multiValue: (base, state) => {
         return state.data.isFixed ? { ...base, paddingRight: "4px" } : base;
      },
      multiValueLabel: (base, state) => {
         return state.data.isFixed ? base : base;
      },
      multiValueRemove: (base, state) => {
         return state.data.isFixed ? { ...base, display: "none" } : base;
      },
   } satisfies StylesConfig<Option, IsMulti, GroupBase<Option>>;

   const classNames = {
      control: () => "border p-1 rounded",
      valueContainer: () => "flex gap-2",
      multiValue: () => "bg-primary/10 p-0.5 rounded",
      multiValueRemove: () => "rounded-full text-gray-500 hover:text-gray-800",
      menuList: () => "bg-background p-1 rounded z-10 border",
      option: ({ isFocused, isSelected }) =>
         cn(isFocused && "bg-primary/10", isSelected && "bg-primary/10", "px-2 py-1"),
   } satisfies ClassNamesConfig<Option, IsMulti, GroupBase<Option>>;

   return { components: customComponents, classNames, styles, unstyled: true } satisfies Partial<
      ComponentProps<typeof Select<Option, IsMulti, GroupBase<Option>>>
   >;
};
