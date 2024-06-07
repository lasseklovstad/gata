import { AppLoadContext } from "@remix-run/node";
import { env } from "~/utils/env.server";

type MailData = {
   to: { email: string }[];
   html: string;
   subject: string;
};

const from = {
   email: "hesten.bla@gataersamla.no",
   name: "Hesten Blå",
};

export const sendMail = async (context: AppLoadContext, mailData: MailData) => {
   const apiKey = env.SENDGRID_API_KEY;
   const url = "https://api.sendgrid.com/v3/mail/send";

   const emailData = {
      personalizations: [
         {
            to: mailData.to,
            subject: mailData.subject,
         },
      ],
      from,
      content: [
         {
            type: "text/html",
            value: mailData.html,
         },
      ],
   };

   try {
      const response = await fetch(url, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
         },
         body: JSON.stringify(emailData),
      });

      if (response.ok) {
         console.log("Email sent successfully!");
      } else {
         const errorData = await response.json();
         console.error("Error sending email:", errorData);
      }
   } catch (error) {
      console.error("Network error:", error);
   }
};
