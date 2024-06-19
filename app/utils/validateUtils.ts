import type { ZodError } from "zod";

export type TransformedError = ReturnType<typeof transformErrorResponse>["errors"][number];

export const transformErrorResponse = (error: ZodError) => {
   return { errors: error.errors.map((error) => ({ message: error.message, path: error.path })), ok: false } as const;
};

export const isTransformErrors = (errors: unknown): errors is TransformedError[] => {
   if (Array.isArray(errors)) {
      const allAreErrors = errors.every((error) => "path" in error && "message" in error);
      return allAreErrors;
   }
   return false;
};
