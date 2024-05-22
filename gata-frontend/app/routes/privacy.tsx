import { PageLayout } from "~/components/PageLayout";
import { Typography } from "~/components/ui/typography";

export default function Privacy() {
   return (
      <PageLayout>
         <Typography variant="h1">Privacy Policy</Typography>
         <Typography>Last updated: January 29, 2024</Typography>
         <Typography variant="h2">Introduction</Typography>
         <Typography>
            Welcome to Gata! We understand the importance of privacy and want to assure you that your personal
            information is handled with care and respect. This Privacy Policy explains how we collect, use, share, and
            protect your personal information..
         </Typography>
         <Typography variant="h2">Information We Collect</Typography>
         <Typography variant="h3">Facebook and social media Login:</Typography>
         <Typography>
            When you choose to log in to Gata via Facebook, you grant us permission to access and store certain
            information from your Facebook profile. This may include, but is not limited to, your name, profile picture,
            email address, and other relevant data in accordance with Facebook guidelines.
         </Typography>
         <Typography variant="h3">Other information:</Typography>
         <Typography>
            We may also collect other information that you voluntarily provide to us through interactions with the
            website, such as participating in events, commenting on posts, or filling out forms.
         </Typography>
         <Typography variant="h2">How We Use the Information</Typography>
         <Typography variant="h3">Authentication:</Typography>
         <Typography>To allow login and authentication via Facebook and provide you access to Gata.</Typography>
         <Typography variant="h3">Personalization:</Typography>
         <Typography>To customize your experience on Gata based on your interests and activities.</Typography>
         <Typography variant="h3">Communication:</Typography>
         <Typography>
            To send you relevant information, notifications, and updates related to your use of our services.
         </Typography>

         <Typography variant="h2">Sharing of Information</Typography>
         <Typography>
            We do not share personal information with third parties without your consent unless necessary to deliver our
            services or in compliance with applicable laws and regulations.
         </Typography>

         <Typography variant="h2">Your Rights</Typography>
         <Typography>
            You have the right to request access to, correction of, or deletion of your personal information. Please
            contact us if you have questions about our privacy policy or wish to exercise your rights.
         </Typography>

         <Typography variant="h2">Changes to the Privacy Policy</Typography>
         <Typography>
            We reserve the right to update this Privacy Policy. Any changes will be posted on this page, and the last
            updated date will be modified accordingly.
         </Typography>

         <Typography variant="h2">Contact Us</Typography>
         <Typography>
            If you have any questions about this Privacy Policy, please contact us at: lasse.klovstad@gmail.com
         </Typography>
      </PageLayout>
   );
}
