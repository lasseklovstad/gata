import { href } from "react-router";
import type { PushSubscription } from "web-push";

import type { ReportSchema } from "~/utils/formSchema";

import { getAllSubscriptions } from "../db/pushSubscriptions";
import { insertReport } from "../db/report";
import type { User } from "../db/user";
import { sendPushNotification } from "../services/pushNoticiationService";

export const insertReportAndNotify = async (values: ReportSchema, loggedInUser: User) => {
   const [report] = await insertReport(values, loggedInUser);
   await notifyNewReport(loggedInUser, report.title, report.id);
   return report;
};

const notifyNewReport = async (loggedInUser: User, title: string, reportId: string) => {
   const subscriptions = await getAllSubscriptions(loggedInUser.id);
   await sendPushNotification(
      subscriptions.map((s) => s.subscription as PushSubscription),
      {
         body: `📄 Nyhet - ${title}`,
         data: { url: href("/reportInfo/:reportId", { reportId }) },
         icon: "/logo192.png",
      }
   );
};
