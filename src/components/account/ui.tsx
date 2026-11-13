"use client";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
export const inputClass =
  "mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground";
export const money = (value: unknown) =>
  "₦" +
  Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 });
export const date = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-NG", {
        timeZone: "Africa/Lagos",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";
export function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="min-w-0 space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-7">
      {children}
    </section>
  );
}
export function ErrorNotice({
  error,
  retry,
}: {
  error?: string;
  retry?: () => void;
}) {
  return error ? (
    <div
      role="alert"
      className="rounded-xl border border-destructive/20 bg-destructive-soft p-4 text-destructive"
    >
      <p>{error}</p>
      {retry && (
        <Button variant="outline" onClick={retry} className="mt-3">
          Retry
        </Button>
      )}
    </div>
  ) : null;
}
export function Loading() {
  return (
    <p role="status" className="py-8 text-muted-foreground">
      Loading…
    </p>
  );
}
export function Pager({
  page,
  total,
  pageSize = 12,
  onChange,
}: {
  page: number;
  total: number;
  pageSize?: number;
  onChange: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-4 py-3"
    >
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm">
        Page {page} of {pages}
      </span>
      <Button
        variant="outline"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    window.prompt("Select and copy this text:", value);
    return false;
  }
}
export type ApiPage<T> = {
  items: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages?: number;
  };
};
