import { Checkbox, Heading, Link, List, ListItem, OrderedList, Text, UnorderedList } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
   text: string;
};

export const MarkdownPreview = ({ text }: Props) => {
   return (
      <ReactMarkdown
         remarkPlugins={[remarkGfm]}
         components={{
            h1: ({ children }) => (
               <Heading as="h1" size="2xl">
                  {children}
               </Heading>
            ),
            h2: ({ children }) => (
               <Heading as="h2" size="xl">
                  {children}
               </Heading>
            ),
            h3: ({ children }) => (
               <Heading as="h3" size="lg">
                  {children}
               </Heading>
            ),
            h4: ({ children }) => (
               <Heading as="h4" size="md">
                  {children}
               </Heading>
            ),
            h5: ({ children }) => (
               <Heading as="h5" size="sm">
                  {children}
               </Heading>
            ),
            h6: ({ children }) => (
               <Heading as="h6" size="xs">
                  {children}
               </Heading>
            ),
            p: ({ children }) => (
               <Text as="p" mb={3}>
                  {children}
               </Text>
            ),
            a: ({ children, href }) => (
               <Link href={href} target="_blank">
                  {children}
               </Link>
            ),
            ul: ({ children, className }) => {
               if (className === "contains-task-list") {
                  return <List>{children}</List>;
               }
               return <UnorderedList>{children}</UnorderedList>;
            },
            ol: ({ children }) => <OrderedList>{children}</OrderedList>,
            li: ({ children }) => <ListItem>{children}</ListItem>,
            input: ({ checked, disabled, type }) => {
               if (type === "checkbox") {
                  return <Checkbox disabled={disabled} mt={1} defaultChecked={checked} />;
               }
               return undefined;
            },
         }}
      >
         {text}
      </ReactMarkdown>
   );
};
