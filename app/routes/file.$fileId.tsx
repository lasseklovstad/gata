import { getReportFile } from "~/.server/db/reportFile";
import { getRequiredUser } from "~/utils/auth.server";

import type { Route } from "./+types/file.$fileId";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
   await getRequiredUser(request);
   return await getReportFile(params.fileId);
};
