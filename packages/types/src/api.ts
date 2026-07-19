/**
 * Standard envelope every API route in the app returns, so client-side
 * React Query hooks can handle success/error uniformly instead of each
 * feature inventing its own response shape.
 */
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    message: string;
    code: string;
    /** Field-level validation errors, e.g. from a Zod safeParse failure. */
    fieldErrors?: Record<string, string[]>;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function apiError(message: string, code = "BAD_REQUEST", fieldErrors?: Record<string, string[]>): ApiError {
  return { success: false, error: { message, code, fieldErrors } };
}
