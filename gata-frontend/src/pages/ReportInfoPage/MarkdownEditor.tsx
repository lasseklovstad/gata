import { Box, Button, IconButton, Tab, TabList, TabPanel, TabPanels, Tabs, Textarea } from "@chakra-ui/react";
import {
   FormatBold,
   FormatItalic,
   FormatListBulleted,
   FormatListNumbered,
   HorizontalRule,
   Link,
   StrikethroughS,
   Image,
} from "@mui/icons-material";
import { useRef, useState } from "react";

import { MarkdownPreview } from "../../components/MarkdownPreview";

// To try using the depreacted Document.execCommand() to change the value in the textfield when clicking toolbar options
// The execute command makes it possible på manipulate input value without loosing input history
// Defaults to true
const useExecCommand = true;

export const MarkdownEditor = () => {
   const [value, onChange] = useState("");

   const inputRef = useRef<HTMLTextAreaElement | null>(null);

   const getSelection = (selectionStart: number, selectionEnd: number) => {
      const selectionBefore = value.substring(0, selectionStart);
      const selection = selectionStart === selectionEnd ? "" : value.substring(selectionStart, selectionEnd);
      const selectionAfter = value.substring(selectionEnd);
      return { selectionBefore, selection, selectionAfter };
   };

   const changeInputValue = (textToAdd: string, allText: string) => {
      if (useExecCommand && inputRef.current) {
         const isSuccess = setTextValue(inputRef.current, textToAdd);
         if (isSuccess) {
            return;
         }
      }
      // Fallback to using onChange
      // Bas side of this is that the history of the input element is cleared each time.
      onChange(allText);
      if (inputRef.current) {
         // Set the value to be able to correctly place the cursor
         inputRef.current.value = allText;
      }
   };

   const addBeforeAndAfterSelection = (valueBefore: string, valueAfter?: string, defaultSelection?: string) => {
      if (inputRef.current) {
         const { selectionStart, selectionEnd } = inputRef.current;
         if (selectionStart !== null && selectionEnd !== null && selectionEnd !== selectionStart) {
            const { selectionBefore, selection, selectionAfter } = getSelection(selectionStart, selectionEnd);
            const text = valueBefore + selection + (valueAfter ?? valueBefore);
            const newValue = selectionBefore + text + selectionAfter;
            changeInputValue(text, newValue);
            setSelectionRange(inputRef.current, selectionStart, selectionStart + text.length);
            return;
         }
         if (selectionStart !== null && defaultSelection) {
            const { selectionBefore, selectionAfter } = getSelection(selectionStart, selectionStart);
            const text = valueBefore + defaultSelection + (valueAfter ?? valueAfter);
            const newValue = selectionBefore + text + selectionAfter;
            changeInputValue(text, newValue);
            setSelectionRange(inputRef.current, selectionStart, selectionStart + text.length);
            return;
         }
      }
   };

   const addAfterSelectionStart = (value: string) => {
      if (inputRef.current) {
         const { selectionStart, selectionEnd } = inputRef.current;
         if (selectionStart !== null) {
            // If selectionEnd is set the selection will be replaces by the vale
            const { selectionBefore, selectionAfter } = getSelection(selectionStart, selectionEnd ?? selectionStart);
            const text = `\n\n${value}\n\n`;
            const newValue = selectionBefore + text + selectionAfter;
            changeInputValue(text, newValue);
            setSelectionRange(inputRef.current, selectionStart + text.length);
         }
      }
   };

   const addListToSelection = (value: string) => {
      if (inputRef.current) {
         const { selectionStart, selectionEnd } = inputRef.current;
         if (selectionStart !== null) {
            const { selectionBefore, selection, selectionAfter } = getSelection(
               selectionStart,
               selectionEnd ?? selectionStart
            );
            const text = `\n\n${value} ${selection}\n\n`;
            const newValue = selectionBefore + text + selectionAfter;
            changeInputValue(text, newValue);
            setSelectionRange(inputRef.current, selectionStart + text.length - 2);
         }
      }
   };

   const addToStartOfLine = (value: string) => {
      if (inputRef.current) {
         const { selectionStart } = inputRef.current;
         if (selectionStart !== null) {
            const startOfLine = getStartOfLine(selectionStart, inputRef.current.value);
            const { selectionBefore, selectionAfter } = getSelection(startOfLine, startOfLine);
            const text = `${value} `;
            const newValue = selectionBefore + text + selectionAfter;
            setSelectionRange(inputRef.current, startOfLine);
            changeInputValue(text, newValue);
            setSelectionRange(inputRef.current, selectionStart + text.length);
         }
      }
   };

   return (
      <>
         <Tabs>
            <TabList>
               <Tab>Rediger</Tab>
               <Tab>Forhåndsvisning</Tab>
            </TabList>

            <TabPanels>
               <TabPanel>
                  <Box
                     sx={{
                        display: "flex",
                        mb: 1,
                        gap: 1,
                        alignItems: "center",
                        borderRadius: "md",
                        border: "1px",
                        bg: "white",
                        borderColor: "gray.200",
                     }}
                  >
                     {[1, 2, 3].map((titleLevel) => (
                        <Button
                           key={titleLevel}
                           colorScheme="gray"
                           variant="ghost"
                           onMouseDown={(e) => e.preventDefault()}
                           onClick={(ev) => {
                              ev.preventDefault();
                              addToStartOfLine("#".repeat(titleLevel));
                           }}
                        >
                           H{titleLevel}
                        </Button>
                     ))}
                     {[
                        {
                           id: "italic",
                           ariaLabel: "Italic",
                           Icon: <FormatItalic />,
                           command: () => addBeforeAndAfterSelection("*"),
                        },
                        {
                           id: "bold",
                           ariaLabel: "Bold",
                           Icon: <FormatBold />,
                           command: () => addBeforeAndAfterSelection("**"),
                        },
                        {
                           id: "strike",
                           ariaLabel: "Strike through",
                           Icon: <StrikethroughS />,
                           command: () => addBeforeAndAfterSelection("~~"),
                        },
                        {
                           id: "divider",
                           ariaLabel: "Divider",
                           Icon: <HorizontalRule />,
                           command: () => addAfterSelectionStart("-----------"),
                        },
                        {
                           id: "image",
                           ariaLabel: "Image",
                           Icon: <Image />,
                           command: () =>
                              addBeforeAndAfterSelection(
                                 "![Image description here](",
                                 ")",
                                 "https://www.example.com/image.png"
                              ),
                        },
                        {
                           id: "link",
                           ariaLabel: "Link",
                           Icon: <Link />,
                           command: () => addBeforeAndAfterSelection("[", "](URL here)", "Link text here"),
                        },
                        {
                           id: "bulletList",
                           ariaLabel: "Bullet list",
                           Icon: <FormatListBulleted />,
                           command: () => addListToSelection("-"),
                        },
                        {
                           id: "numberedList",
                           ariaLabel: "Numbered list",
                           Icon: <FormatListNumbered />,
                           command: () => addListToSelection("1."),
                        },
                     ].map(({ id, Icon, command, ariaLabel }) => (
                        <IconButton
                           key={id}
                           variant="ghost"
                           colorScheme="gray"
                           aria-label={ariaLabel}
                           onMouseDown={(e) => e.preventDefault()}
                           onClick={(ev) => {
                              ev.preventDefault();
                              command();
                           }}
                        >
                           {Icon}
                        </IconButton>
                     ))}
                  </Box>
                  <Textarea
                     bg="white"
                     minHeight="300px"
                     value={value}
                     ref={inputRef}
                     onChange={(e) => onChange(e.target.value)}
                     placeholder="Begynn å skriv markdown..."
                  />
               </TabPanel>
               <TabPanel>
                  <MarkdownPreview text={value} />
               </TabPanel>
            </TabPanels>
         </Tabs>
      </>
   );
};

const setTextValue = (input: HTMLTextAreaElement, value: string) => {
   input.focus();
   // https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative
   // Execute command is deprecated but will be supported by most browser anyway
   // eslint-disable-next-line deprecation/deprecation
   const isSuccess = document.execCommand && document.execCommand("insertText", false, value);
   return isSuccess;
};

const setSelectionRange = (input: HTMLTextAreaElement, start: number, end?: number) => {
   input.focus();
   input.selectionStart = start;
   input.selectionEnd = end ?? start;
};

const getStartOfLine = (selectionIndex: number, text: string) => {
   let startIndex = 0;

   while (selectionIndex--) {
      const char = text[selectionIndex];
      if (char === "\n") {
         startIndex = selectionIndex + 1;
         break;
      }
   }

   return startIndex;
};
