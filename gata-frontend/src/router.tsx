import { Alert, AlertDescription, AlertTitle, Box, Container, Progress, Text } from "@chakra-ui/react";
import { ResponsiveAppBar } from "./components/ResponsiveAppBar";
import {
   createBrowserRouter,
   createRoutesFromElements,
   isRouteErrorResponse,
   json,
   LoaderFunction,
   Outlet,
   redirect,
   Route,
   useLoaderData,
   useNavigation,
   useRouteError,
} from "react-router-dom";
import { Privacy } from "./components/Privacy";
import { userSubscribeAction } from "./pages/member/MemberInfo/UserSubscribe";
import { ReportPage, reportPageLoader } from "./pages/Report/ReportPage";
import { ReportInfoPage, reportInfoPageAction, reportInfoPageLoader } from "./pages/ReportInfoPage/ReportInfoPage";
import { ResponsibilityPage, responsibilityPageLoader } from "./pages/Responsibility/ResponsibilityPage";
import { MemberPage, memberPageAction, memberPageLoader } from "./pages/member/MemberPage";
import {
   MemberInfoPage,
   memberInfoPageAction,
   memberInfoPageLoader,
   memberRoleAction,
} from "./pages/member/MemberInfo/MemberInfoPage";
import { Home, homeLoader } from "./pages/Home";
import * as React from "react";
import { contingentAction } from "./pages/member/components/UserInfo";
import { primaryUserEmailAction } from "./components/SelectPrimaryEmail";
import { externalUserProvidersAction } from "./pages/member/components/LinkExternalUserToGataUserSelect";
import { MemberLayout } from "./pages/member/MemberLayout";
import { client } from "./api/client/client";
import { IGataUser } from "./types/GataUser.type";
import {
   MemberResponsibility,
   memberResponsibilityAction,
   memberResponsibilityLoader,
} from "./pages/member/MemberInfo/MemberResponsibility";
import {
   AddResponsibilityUserDialog,
   addResponsibilityUserDialogLoader,
} from "./pages/member/components/AddResponsibilityUserDialog";
import { RouteConfirmFormDialog } from "./RouteConfirmFormDialog";
import { deleteResponsibilityYearAction } from "./pages/member/MemberInfo/deleteResponsibilityYearAction";
import { putResponsibilityYearAction } from "./pages/member/MemberInfo/putResponsibilityYearAction";
import {
   ResponsibilityDialog,
   responsibilityDialogAction,
   responsibilityDialogLoader,
} from "./pages/Responsibility/ResponsibilityDialog";
import { deleteResponsibilityAction } from "./pages/Responsibility/deleteResponsibilityAction";
import { getIsAuthenticated, getRequiredAccessToken, getUser, handleRedirectCallback } from "./auth0Client";
import {
   GataReportFormDialog,
   gataReportFormDialogAction,
   gataReportFormDialogLoader,
} from "./components/GataReportFormDialog";
import { deleteReportAction } from "./pages/ReportInfoPage/deleteReportAction";
import { User } from "@auth0/auth0-spa-js";

export const rootLoader: LoaderFunction = async ({ request: { signal } }) => {
   const isAuthenticated = await getIsAuthenticated();
   if (isAuthenticated) {
      const user = await getUser();
      try {
         const token = await getRequiredAccessToken();
         const loggedInUser = await client<IGataUser>("user/loggedin", { token, signal });
         return json<RootLoaderData>({ isAuthenticated, loggedInUser, user });
      } catch (e) {
         return json<RootLoaderData>({ isAuthenticated, user });
      }
   }
   return json<RootLoaderData>({ isAuthenticated });
};

export interface RootLoaderData {
   loggedInUser?: IGataUser;
   isAuthenticated: boolean;
   user?: User;
}

const Root = () => {
   const { loggedInUser, isAuthenticated, user } = useLoaderData() as RootLoaderData;
   const { state } = useNavigation();
   return (
      <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
         <ResponsiveAppBar loggedInUser={loggedInUser} isAuthenticated={isAuthenticated} user={user} />
         <Progress size="xs" colorScheme="blue" isIndeterminate={state === "loading"} hasStripe />
         <Container as="main" maxW="6xl" sx={{ mb: 16 }}>
            <Outlet />
         </Container>
         <Box as="footer" sx={{ marginTop: "auto", p: 1 }}>
            <Text>Versjon: {APP_VERSION}</Text>
         </Box>
      </Box>
   );
};

export const ErrorBoundary = () => {
   let error = useRouteError();

   if (isRouteErrorResponse(error)) {
      // the response json is automatically parsed to
      // `error.data`, you also have access to the status
      if (error.status === 401) {
         return (
            <Alert status="error">
               <AlertTitle>Du er ikke logget inn</AlertTitle>
               <AlertDescription>Logg inn for å gjøre noe!</AlertDescription>
            </Alert>
         );
      }
      if (error.status === 403) {
         return (
            <Alert status="error">
               <AlertTitle>Du har ikke tilgang</AlertTitle>
               <AlertDescription>Ta kontakt med brukerstøtte for å få tilgang!</AlertDescription>
            </Alert>
         );
      }
      return (
         <Alert status="error">
            <AlertTitle>Det oppstod en feil</AlertTitle>

            <AlertDescription>{error.data.message}</AlertDescription>
         </Alert>
      );
   }

   if (error instanceof Error) {
      return (
         <Alert status="error">
            <AlertTitle>Det oppstod en ukjent feil</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
         </Alert>
      );
   }

   return (
      <Alert status="error">
         <AlertTitle>Det oppstod en ukjent feil</AlertTitle>
         <AlertDescription>Prøv å last siden inn på nytt og prøv på nytt.</AlertDescription>
      </Alert>
   );
};

export const router = createBrowserRouter(
   createRoutesFromElements(
      <Route path="/" element={<Root />} loader={rootLoader} errorElement={<ErrorBoundary />}>
         <Route
            path="callback"
            loader={async () => {
               await handleRedirectCallback();
               return redirect("/");
            }}
         />
         <Route path="privacy" element={<Privacy />} />
         <Route path="" loader={homeLoader} element={<Home />}>
            <Route
               path="new"
               action={gataReportFormDialogAction}
               loader={gataReportFormDialogLoader}
               element={<GataReportFormDialog type="NEWS" />}
            />
         </Route>
         <Route path="report" loader={reportPageLoader} element={<ReportPage />}>
            <Route
               path="new"
               action={gataReportFormDialogAction}
               loader={gataReportFormDialogLoader}
               element={<GataReportFormDialog type="DOCUMENT" />}
            />
         </Route>
         <Route
            path="reportInfo/:reportId"
            loader={reportInfoPageLoader}
            action={reportInfoPageAction}
            element={<ReportInfoPage />}
         >
            <Route
               path="edit"
               action={gataReportFormDialogAction}
               loader={gataReportFormDialogLoader}
               element={<GataReportFormDialog />}
            />
            <Route
               path=":reportType/delete"
               action={deleteReportAction}
               element={
                  <RouteConfirmFormDialog
                     text="Ved å slette dokumentet mister du all data"
                     backTo=".."
                     method="delete"
                  />
               }
            />
         </Route>
         <Route path="responsibility" loader={responsibilityPageLoader} element={<ResponsibilityPage />}>
            <Route
               path=":responsibilityId/delete"
               action={deleteResponsibilityAction}
               element={
                  <RouteConfirmFormDialog text="Ved å slette mister du ansvarsposten" backTo=".." method="delete" />
               }
            />
            <Route
               path=":responsibilityId"
               action={responsibilityDialogAction}
               loader={responsibilityDialogLoader}
               element={<ResponsibilityDialog />}
            />
         </Route>
         <Route path="member" element={<MemberPage />} loader={memberPageLoader} action={memberPageAction} />
         <Route path="member/:memberId" element={<MemberLayout />} errorElement={<ErrorBoundary />}>
            <Route path="subscribe" action={userSubscribeAction} />
            <Route path="contingent" action={contingentAction} />
            <Route path="primaryUserEmail" action={primaryUserEmailAction} />
            <Route path="externaluserproviders" action={externalUserProvidersAction} />
            <Route path="role" action={memberRoleAction} />
            <Route path="overview" element={<div>Her kommer magnus sin oversikt</div>} />
            <Route
               path="responsibility"
               element={<MemberResponsibility />}
               loader={memberResponsibilityLoader}
               action={memberResponsibilityAction}
            >
               <Route path="new" loader={addResponsibilityUserDialogLoader} element={<AddResponsibilityUserDialog />} />
               <Route path=":responsibilityYearId" action={putResponsibilityYearAction} />
               <Route
                  path=":responsibilityYearId/delete"
                  action={deleteResponsibilityYearAction}
                  element={
                     <RouteConfirmFormDialog
                        text="Ved å slette mister brukeren ansvarsposten"
                        backTo=".."
                        method="delete"
                     />
                  }
               />
            </Route>
            <Route path="" loader={memberInfoPageLoader} action={memberInfoPageAction} element={<MemberInfoPage />} />
         </Route>
      </Route>,
   ),
);