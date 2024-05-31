export const badRequest = (message: string) => {
   return new Response(message, { status: 400 });
};
