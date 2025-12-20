export const badRequest = (message: string) => {
   return new Response(message, { status: 400 });
};

export const unauthorized = (message = "Unauthorized") => {
   return new Response(message, { status: 403 });
};
