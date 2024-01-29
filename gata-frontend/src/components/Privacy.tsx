import { Heading, Text } from "@chakra-ui/react";

import { PageLayout } from "./PageLayout";

export const Privacy = () => {
   return (
      <PageLayout>
         <Heading as="h1">Privacy Policy</Heading>
         <Text>Last updated: January 29, 2024</Text>
         <Heading as="h2" size="lg">
            Introduction
         </Heading>
         <Text mb={4}>
            Welcome to Gata! We understand the importance of privacy and want to assure you that your personal
            information is handled with care and respect. This Privacy Policy explains how we collect, use, share, and
            protect your personal information..
         </Text>
         <Heading as="h2" size="lg" mb={2}>
            Information We Collect
         </Heading>
         <Heading as="h3" size="md">
            Facebook and social media Login:
         </Heading>
         <Text mb={2}>
            When you choose to log in to Gata via Facebook, you grant us permission to access and store certain
            information from your Facebook profile. This may include, but is not limited to, your name, profile picture,
            email address, and other relevant data in accordance with Facebook guidelines.
         </Text>
         <Heading as="h3" size="md">
            Other information:
         </Heading>
         <Text mb={2}>
            We may also collect other information that you voluntarily provide to us through interactions with the
            website, such as participating in events, commenting on posts, or filling out forms.
         </Text>
         <Heading as="h2" size="lg" mb={2}>
            How We Use the Information
         </Heading>
         <Heading as="h3" size="md">
            Authentication:
         </Heading>
         <Text>To allow login and authentication via Facebook and provide you access to Gata.</Text>
         <Heading as="h3" size="md">
            Personalization:
         </Heading>
         <Text>To customize your experience on Gata based on your interests and activities.</Text>
         <Heading as="h3" size="md">
            Communication:
         </Heading>
         <Text mb={2}>
            To send you relevant information, notifications, and updates related to your use of our services.
         </Text>

         <Heading as="h2" size="lg">
            Sharing of Information
         </Heading>
         <Text mb={4}>
            We do not share personal information with third parties without your consent unless necessary to deliver our
            services or in compliance with applicable laws and regulations.
         </Text>

         <Heading as="h2" size="lg">
            Your Rights
         </Heading>
         <Text mb={4}>
            You have the right to request access to, correction of, or deletion of your personal information. Please
            contact us if you have questions about our privacy policy or wish to exercise your rights.
         </Text>

         <Heading as="h2" size="xl">
            Changes to the Privacy Policy
         </Heading>
         <Text mb={4}>
            We reserve the right to update this Privacy Policy. Any changes will be posted on this page, and the last
            updated date will be modified accordingly.
         </Text>

         <Heading as="h2" size="xl">
            Contact Us
         </Heading>
         <Text mb={4}>
            If you have any questions about this Privacy Policy, please contact us at: lasse.klovstad@gmail.com
         </Text>
      </PageLayout>
   );
};
