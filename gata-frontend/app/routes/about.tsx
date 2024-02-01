import { Heading, Text } from "@chakra-ui/react";
import { Fragment } from "react";

import { PageLayout } from "../old-app/components/PageLayout";

export default function About() {
   return (
      <PageLayout>
         <Heading as="h1">Welcome to Gata - A Digital Hub for Lifelong Connections</Heading>
         <Text>
            Welcome to Gata, a digital space dedicated to celebrating the enduring bonds of friendship. As a group of
            lifelong friends, we&apos;ve established this platform to honor the meaningful connections we&apos;ve
            nurtured over the years.
         </Text>
         {[
            {
               title: "About Us",
               content: (
                  <>
                     Gata is an exclusive community of individuals who share a history of camaraderie since childhood.
                     From shared childhood games to our annual Christmas gatherings, we&apos;ve cultivated a bond that
                     defines our unique friendship.
                  </>
               ),
            },
            {
               title: "Membership",
               content: (
                  <>
                     Membership in Gata is reserved for those with a significant history of friendship within our
                     circle. We value the depth of our connections and, as such, new memberships are not open to the
                     public.
                  </>
               ),
            },
            {
               title: "Purpose of the Website",
               content: (
                  <>
                     This website serves as a private space for our members. It provides essential information about
                     member roles, payment details, and serves as an event hub where we document our shared experiences.
                  </>
               ),
            },
            {
               title: "Exclusive Access",
               content: (
                  <>
                     Please note that this website is accessible only to registered members of Gata. To maintain the
                     exclusivity and privacy of our community, access to the site&apos;s features is restricted.
                  </>
               ),
            },
            {
               title: "Thank You for Visiting",
               content: (
                  <>
                     For those who are part of our Gata family, this website is more than a digital space; it&apos;s a
                     testament to the enduring strength of our friendships. We appreciate your understanding and look
                     forward to sharing more memories together.
                  </>
               ),
            },
         ].map(({ title, content }) => {
            return (
               <Fragment key={title}>
                  <Heading as="h2" size="lg" mt={3}>
                     {title}
                  </Heading>
                  <Text as="p">{content}</Text>
               </Fragment>
            );
         })}
      </PageLayout>
   );
}
