import type { ExternalUser } from "db/schema";

type ExternalUserIconProps = {
   user: ExternalUser;
};

// SVGs copied from https://simpleicons.org

export const ExternalUserIcon = ({ user }: ExternalUserIconProps) => {
   return (
      <>
         {user.id.includes("facebook") && (
            <svg
               className="h-6 w-6 flex-shrink-0"
               fill="#0866FF"
               role="img"
               viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg"
            >
               <title>Facebook</title>
               <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            </svg>
         )}
         {user.id.includes("google") && (
            <svg
               role="img"
               fill="#4285F4"
               className="h-6 w-6 flex-shrink-0"
               viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg"
            >
               <title>Google</title>
               <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
         )}
         {user.id.includes("auth0") && (
            <svg
               className="h-6 w-6 flex-shrink-0"
               fill="#EB5424"
               role="img"
               viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg"
            >
               <title>Auth0</title>
               <path d="M21.98 7.448L19.62 0H4.347L2.02 7.448c-1.352 4.312.03 9.206 3.815 12.015L12.007 24l6.157-4.552c3.755-2.81 5.182-7.688 3.815-12.015l-6.16 4.58 2.343 7.45-6.157-4.597-6.158 4.58 2.358-7.433-6.188-4.55 7.63-.045L12.008 0l2.356 7.404 7.615.044z" />
            </svg>
         )}
      </>
   );
};
