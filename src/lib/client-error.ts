import { toast } from "sonner";

/**
 * Standardized client-side error handler.
 * Logs the full technical error to the console for debugging.
 * Displays a user-friendly generic message to the user.
 *
 * @param error The unknown error object caught in the catch block
 * @param title A short, user-friendly title for the error (e.g. "Search failed")
 * @param fallbackMessage Optional specific message to show if needed, otherwise defaults to a generic one
 */
export function handleClientError(
    error: unknown,
    title: string,
    fallbackMessage = "An unexpected error occurred. Please try again later."
) {
    // 1. Log technical details for developers
    console.error(`[Client Error] ${title}:`, error);

    // 2. Extract a technical message if possible (for context, generally not shown to user unless verified safe)
    // In this strict mode, we deliberately IGNORE the error.message for the toast
    // to prevent "Vector search failed: ..." from appearing.

    // We only show the title + generic message
    toast.error(title, {
        description: fallbackMessage,
    });
}
