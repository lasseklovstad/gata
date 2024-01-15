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
   Save,
} from "@mui/icons-material";
import { useRef, useState } from "react";
import { useFetcher } from "react-router-dom";

import { LoadingButton } from "../../components/Loading";
import { MarkdownPreview } from "../../components/MarkdownPreview";

type Props = {
   value: string;
   onCancel: () => void;
};

export const MarkdownEditor = ({ value, onCancel }: Props) => {
   const fetcher = useFetcher();
   const inputRef = useRef<HTMLTextAreaElement | null>(null);

   const changeInputValue = (textToAdd: string) => {
      if (inputRef.current) {
         setTextValue(inputRef.current, textToAdd);
      }
   };

   const addBeforeAndAfterSelection = (valueBefore: string, valueAfter?: string, defaultSelection?: string) => {
      if (inputRef.current) {
         const { selectionStart, selectionEnd } = inputRef.current;
         if (selectionStart !== null && selectionEnd !== null && selectionEnd !== selectionStart) {
            const { selection } = getSelection(inputRef.current);
            const text = valueBefore + selection + (valueAfter ?? valueBefore);
            changeInputValue(text);
            setSelectionRange(inputRef.current, selectionStart, selectionStart + text.length);
            return;
         }
         if (selectionStart !== null && defaultSelection) {
            const text = valueBefore + defaultSelection + (valueAfter ?? valueAfter);
            changeInputValue(text);
            setSelectionRange(inputRef.current, selectionStart, selectionStart + text.length);
            return;
         }
      }
   };

   const addAfterSelectionStart = (value: string) => {
      if (inputRef.current) {
         const { selectionStart } = inputRef.current;
         if (selectionStart !== null) {
            const text = `\n\n${value}\n\n`;
            changeInputValue(text);
            setSelectionRange(inputRef.current, selectionStart + text.length);
         }
      }
   };

   const addListToSelection = (value: string) => {
      if (inputRef.current) {
         const { selectionStart } = inputRef.current;
         if (selectionStart !== null) {
            const { selection } = getSelection(inputRef.current);
            const text = `\n\n${value} ${selection}\n\n`;
            changeInputValue(text);
            setSelectionRange(inputRef.current, selectionStart + text.length - 2);
         }
      }
   };

   const addToStartOfLine = (value: string) => {
      if (inputRef.current) {
         const { selectionStart } = inputRef.current;
         if (selectionStart !== null) {
            const startOfLine = getStartOfLine(selectionStart, inputRef.current.value);
            const text = `${value} `;
            setSelectionRange(inputRef.current, startOfLine);
            changeInputValue(text);
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
               <TabPanel px={0}>
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
                           title={ariaLabel}
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
                  <fetcher.Form method="PUT">
                     <Textarea
                        bg="white"
                        minHeight="300px"
                        defaultValue={value}
                        ref={inputRef}
                        name="markdown"
                        placeholder="Begynn å skriv markdown..."
                        onBlur={(e) => fetcher.submit(e.target.form, { method: "PUT" })}
                     />
                     <Box sx={{ p: 1, display: "flex", justifyContent: "end", gap: 2 }}>
                        <Button type="button" variant="outline" onClick={onCancel} colorScheme="red">
                           Avbryt
                        </Button>
                        <Button
                           type="submit"
                           name="intent"
                           value="saveMarkdown"
                           leftIcon={<Save />}
                           isLoading={fetcher.state !== "idle"}
                        >
                           Lagre
                        </Button>
                     </Box>
                  </fetcher.Form>
               </TabPanel>
               <TabPanel>
                  <MarkdownPreview text={value} />
               </TabPanel>
            </TabPanels>
         </Tabs>
      </>
   );
};

const getSelection = (input: HTMLTextAreaElement) => {
   const { selectionStart, selectionEnd, value } = input;
   const selectionBefore = value.substring(0, selectionStart);
   const selection = selectionStart === selectionEnd ? "" : value.substring(selectionStart, selectionEnd);
   const selectionAfter = value.substring(selectionEnd);
   return { selectionBefore, selection, selectionAfter };
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
