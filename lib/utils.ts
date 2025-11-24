export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

// Normalize Axios/FastAPI error payloads into a human-friendly string.
// FastAPI often returns an array of objects like { type, loc, msg, input } under `detail`.
// Rendering those objects directly in React (e.g., toast.error) causes runtime errors.
export function getErrorMessage(err: any): string {
  const detail = err?.response?.data?.detail;
  if (detail) {
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      // Prefer `msg` if available, otherwise stringify the object safely.
      return detail
        .map((d) => (typeof d?.msg === "string" ? d.msg : safeStringify(d)))
        .join(", ");
    }
    if (typeof detail === "object") {
      if (typeof (detail as any)?.msg === "string") return (detail as any).msg;
      return safeStringify(detail);
    }
  }
  // Fallbacks
  if (typeof err?.message === "string") return err.message;
  return "An unexpected error occurred";
}

function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}