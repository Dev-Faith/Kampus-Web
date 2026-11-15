"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { authApi } from "@/api/auth";
import { authError } from "@/lib/auth-errors";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "@/lib/stores/useToastStore";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { inputClass } from "./ui";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  return (
    <section className="space-y-3 rounded-3xl border border-destructive/20 bg-card p-5">
      <h2 className="font-semibold">Delete account</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Permanently remove your profile and access to Kampus. Review what
        happens before confirming.
      </p>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 aria-hidden="true" /> Delete my account
      </Button>
      {open && <DeleteAccountDialog onClose={() => setOpen(false)} />}
    </section>
  );
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof authApi.accountDeletionPreview>
  > | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    authApi
      .accountDeletionPreview()
      .then((data) => {
        if (active) setPreview(data);
      })
      .catch((cause) => {
        if (active)
          setError(
            authError(
              cause,
              "We couldn’t check your account. Please try again.",
            ),
          );
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !preview?.canDelete || confirmation !== "DELETE" || !password)
      return;
    setBusy(true);
    setError("");
    try {
      await authApi.deleteAccount(password, confirmation);
      useAuthStore.getState().clearSession();
      toast.success("Your account has been deleted.");
      router.replace("/");
      onClose();
    } catch (cause) {
      setError(
        authError(
          cause,
          "Your account could not be deleted. Please try again.",
        ),
      );
      setPassword("");
      setBusy(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <DialogContent
        className="max-w-lg overflow-y-auto p-5 sm:p-7"
        showCloseButton={!busy}
      >
        <div className="space-y-2 pr-7">
          <DialogTitle className="text-xl font-semibold">
            Delete your Kampus account?
          </DialogTitle>
          <DialogDescription>
            This is permanent. You won’t be able to sign in to this account
            again.
          </DialogDescription>
        </div>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            Your contact details, profile photo, saved units, roommate posts and
            conversations will be removed from your account.
          </li>
          {role === "LANDLORD" && (
            <li>
              Your rental listings will no longer be visible, and your saved
              bank details will be removed.
            </li>
          )}
          <li>
            Booking, payment and support records are retained for transaction
            history. Deletion does not cancel a payment or issue a refund.
          </li>
          <li>
            You’ll be signed out on all devices, including the mobile app.
          </li>
        </ul>
        {!preview && !error && (
          <p role="status" className="text-sm text-muted-foreground">
            Checking bookings and payments…
          </p>
        )}
        {preview && !preview.canDelete && (
          <div className="space-y-3 rounded-xl border border-border bg-muted p-4 text-sm">
            <p className="font-medium">
              A few things need to be resolved first
            </p>
            <ul className="list-disc space-y-2 pl-4">
              {preview.blockers.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <Link
              href={
                role === "LANDLORD"
                  ? "/host/bookings"
                  : role === "ADMIN"
                    ? "/admin"
                    : "/bookings"
              }
              className="inline-block text-brand-strong underline"
              onClick={onClose}
            >
              {role === "ADMIN" ? "Open administration" : "Review bookings"}
            </Link>
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {!preview && error && (
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setAttempt((value) => value + 1);
            }}
          >
            Retry account check
          </Button>
        )}
        <form onSubmit={submit} className="space-y-5">
          {preview?.canDelete && (
            <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
              <label className="block text-sm font-medium">
                Current password
                <PasswordInput
                  name="deletionPassword"
                  wrapperClassName="mt-1"
                  autoComplete="current-password"
                  required
                  maxLength={255}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <label className="block text-sm font-medium">
                Type DELETE to confirm
                <input
                  name="deletionConfirmation"
                  className={inputClass}
                  autoComplete="off"
                  spellCheck={false}
                  required
                  pattern="DELETE"
                  maxLength={6}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                />
              </label>
            </fieldset>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Keep my account
            </Button>
            {preview?.canDelete && (
              <Button
                type="submit"
                variant="destructive"
                disabled={busy || confirmation !== "DELETE" || !password}
              >
                {busy ? "Deleting account…" : "Permanently delete account"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
