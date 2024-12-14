import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useLayoutEffect, useRef, useState, type ComponentProps, type Dispatch } from "react";
import getCaretCoordinates from "textarea-caret";

import { AvatarUser } from "~/components/AvatarUser";
import { Textarea } from "~/components/ui/textarea";

type User = { id: string; name: string; picture: string };

type Props = {
   usersWithSubscription: User[];
   value: string;
   setValue: Dispatch<React.SetStateAction<string>>;
   inputProps: Partial<ComponentProps<typeof Textarea>>;
};

export const TextareaWithAutocomplete = ({ setValue, usersWithSubscription, value, inputProps }: Props) => {
   const ref = useRef<HTMLInputElement>(null);
   const [searchValue, setSearchValue] = useState("");
   const [trigger, setTrigger] = useState<string | null>(null);
   const [caretOffset, setCaretOffset] = useState<number | null>(null);

   const textarea = ref.current as unknown as HTMLTextAreaElement | null;

   const filteredPeople = trigger
      ? usersWithSubscription.filter((person) => {
           return person.name.toLowerCase().includes(searchValue.toLowerCase());
        })
      : [];

   useLayoutEffect(() => {
      if (caretOffset != null && textarea) {
         textarea.setSelectionRange(caretOffset, caretOffset);
      }
   }, [caretOffset]);

   const caretCoordinates = textarea ? getCaretCoordinates(textarea, getTriggerOffset(textarea) + 1) : undefined;

   const rect = ref.current?.getBoundingClientRect();
   return (
      <Combobox
         onChange={(option: User | undefined) => {
            if (!textarea || !option) return;
            const offset = getTriggerOffset(textarea);
            const displayValue = option.name;
            setTrigger(null);
            setValue(replaceValue(offset + 1, searchValue, displayValue));
            const nextCaretOffset = offset + displayValue.length + 1;
            setCaretOffset(nextCaretOffset);
         }}
      >
         <ComboboxInput
            {...inputProps}
            as={Textarea}
            value={value}
            ref={ref}
            onKeyDown={(e) => {
               if (e.key === "Enter") {
                  // Headless ui prevents this from happening
                  setValue(value + "\n");
               }
            }}
            onChange={(event) => {
               if (!textarea) return;
               const trigger = getTrigger(textarea);
               const searchValue = getSearchValue(textarea);
               // If there's a trigger character, we'll show the combobox popover. This can
               // be true both when the trigger character has just been typed and when
               // content has been deleted (e.g., with backspace) and the character right
               // before the caret is the trigger.
               if (trigger) {
                  setTrigger(trigger);
               }
               // There will be no trigger and no search value if the trigger character has
               // just been deleted.
               else if (!searchValue) {
                  setTrigger(null);
               }
               // Sets our textarea value.
               setValue(event.target.value);
               // Sets the combobox value that will be used to search in the list.
               setSearchValue(searchValue);
            }}
         />
         {filteredPeople.length > 0 ? (
            <ComboboxOptions
               static
               className="border bg-white rounded"
               anchor={{
                  to: "bottom start",
                  gap: `${caretCoordinates && rect ? caretCoordinates.top + caretCoordinates.height - rect.height : 0}px`,
                  offset: `${caretCoordinates?.left ?? 0}px`,
               }}
            >
               {filteredPeople.map((person) => (
                  <ComboboxOption key={person.id} value={person} className="data-[focus]:bg-blue-100 p-2 flex gap-2">
                     <AvatarUser user={person} className="size-6" />
                     {person.name}
                  </ComboboxOption>
               ))}
            </ComboboxOptions>
         ) : null}
      </Combobox>
   );
};

const defaultTriggers = ["@"];

function getTrigger(element: HTMLTextAreaElement, triggers = defaultTriggers) {
   const { value, selectionStart } = element;
   const previousChar = value[selectionStart - 1];
   if (!previousChar) return null;
   const secondPreviousChar = value[selectionStart - 2];
   const isIsolated = !secondPreviousChar || /\s/.test(secondPreviousChar);
   if (!isIsolated) return null;
   if (triggers.includes(previousChar)) return previousChar;
   return null;
}

function getTriggerOffset(element: HTMLTextAreaElement, triggers = defaultTriggers) {
   const { value, selectionStart } = element;
   for (let i = selectionStart; i >= 0; i--) {
      const char = value[i];
      if (char && triggers.includes(char)) {
         return i;
      }
   }
   return -1;
}

function replaceValue(offset: number, searchValue: string, displayValue: string) {
   return (prevValue: string) => {
      const nextValue = `${
         prevValue.slice(0, offset) + displayValue
      } ${prevValue.slice(offset + searchValue.length + 1)}`;
      return nextValue;
   };
}

function getSearchValue(element: HTMLTextAreaElement, triggers = defaultTriggers) {
   const offset = getTriggerOffset(element, triggers);
   if (offset === -1) return "";
   return element.value.slice(offset + 1, element.selectionStart);
}
