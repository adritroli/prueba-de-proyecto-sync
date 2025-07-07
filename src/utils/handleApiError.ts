import { toast } from "sonner";

export function handleApiError(error: unknown, defaultMsg = "Error inesperado") {
  let msg = defaultMsg;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    msg = (error as { message: string }).message;
  }
  toast.error(msg);
}
