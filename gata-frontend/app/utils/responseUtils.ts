export const badRequest = (message: string) => {
   throw new Response(message, { status: 400 });
};
