import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

console.log(await flatRoutes());

export default flatRoutes() satisfies RouteConfig;
