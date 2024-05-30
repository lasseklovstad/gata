import { AppLoadContext } from "@remix-run/cloudflare";
import sendGrid, { type ResponseError } from "@sendgrid/mail";

type MailData = {
   to: string;
   html: string;
   subject: string;
};

export async function sendMail(context: AppLoadContext, mailData: MailData) {
   sendGrid.setApiKey(context.cloudflare.env.SENDGRID_API_KEY);

   await sendGrid
      .send({
         from: {
            email: "hesten.bla@gataersamla.no",
            name: "Hesten Blå",
         },
         ...mailData,
      })
      .then(
         () => {
            console.log("Email sent success");
         },
         (error: Error) => {
            console.error(error);
         }
      );
}
