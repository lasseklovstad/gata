import { AppLoadContext } from "@remix-run/cloudflare";
import sendGrid, { ResponseError } from "@sendgrid/mail";

type MailData = {
   to: string;
   text: string;
   subject: string;
};

export async function sendMail(context: AppLoadContext, mailData: MailData) {
   sendGrid.setApiKey(context.cloudflare.env.SENDGRID_API_KEY);

   await sendGrid
      .send({
         from: "hesten.bla@gataersamla.no",
         ...mailData,
      })
      .then(
         () => {
            console.log("Email sent success");
         },
         (error: Error | ResponseError) => {
            console.error(error);

            if (error instanceof ResponseError) {
               console.error(error.response.body);
            }
         }
      );
}
