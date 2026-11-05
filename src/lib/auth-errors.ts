import { isAxiosError } from "axios";

export function authError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data;
  const details = Array.isArray(data?.errors)
    ? data.errors.flatMap(
        (item: {
          message?: string;
          messages?: string[];
          constraints?: Record<string, string>;
        }) =>
          item.message
            ? [item.message]
            : item.messages || Object.values(item.constraints || {}),
      )
    : [];
  if (details.length) return details.join(" ");
  if (
    error.response?.status === 503 &&
    /\/auth\/(send-otp|verify-otp)$/.test(error.config?.url || "")
  )
    return "Phone verification is temporarily unavailable. Existing users can sign in with their password.";
  if (Array.isArray(data?.message)) return data.message.join(" ");
  return typeof data?.message === "string" ? data.message : fallback;
}

export function normalizePhone(phone: string): string {
  const value = phone.trim().replace(/[\s()-]/g, "");
  if (/^0\d{10}$/.test(value)) return `+234${value.slice(1)}`;
  if (/^234\d{10}$/.test(value)) return `+${value}`;
  return value;
}
