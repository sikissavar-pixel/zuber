export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

export function getErrorMessage(err: any): string {
  const detail = err?.response?.data?.detail;
  if (detail) {
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => (typeof d?.msg === "string" ? d.msg : safeStringify(d)))
        .join(", ");
    }
    if (typeof detail === "object") {
      if (typeof (detail as any)?.msg === "string") return (detail as any).msg;
      return safeStringify(detail);
    }
  }
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