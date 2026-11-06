"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/api/auth";
import { User } from "@/types/api";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { normalizePhone } from "@/lib/auth-errors";

const inputClass =
  "mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground";

export function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [profile, setProfile] = useState<User | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    authApi
      .getMe()
      .then((user) => {
        if (active) {
          setProfile(user);
          setFailed(false);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  if (!profile)
    return (
      <div role="status" className="space-y-3 py-6">
        <p>
          {failed
            ? "We couldn’t load your profile. Please try again."
            : "Loading your profile…"}
        </p>
        {failed && (
          <Button
            onClick={() => {
              setFailed(false);
              setAttempt(attempt + 1);
            }}
          >
            Retry
          </Button>
        )}
      </div>
    );
  return <ProfileForm profile={profile} onComplete={onComplete} />;
}

function ProfileForm({
  profile,
  onComplete,
}: {
  profile: User;
  onComplete: () => void;
}) {
  const { completeProfile, isLoading, error, clearError } = useAuthStore();
  const host = profile.role === "LANDLORD";
  const [values, setValues] = useState({
    fullName: profile.fullName || "",
    email: profile.email || "",
    phone: profile.phone || "",
    password: "",
    confirmPassword: "",
    matricNumber: profile.student?.matricNumber || "",
    department: profile.student?.department || "",
    businessName: profile.landlord?.businessName || "",
    bankName: profile.landlord?.bankName || "",
    bankAccountNumber: profile.landlord?.bankAccountNumber || "",
    bankAccountName: profile.landlord?.bankAccountName || "",
    bvn: profile.landlord?.bvn || "",
  });
  const [localError, setLocalError] = useState("");
  const field = (
    name: keyof typeof values,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label className="block text-sm font-medium" key={name}>
      {label}
      <input
        name={name}
        className={inputClass}
        value={values[name]}
        required
        maxLength={255}
        onChange={(event) => {
          setValues({ ...values, [name]: event.target.value });
          setLocalError("");
          clearError();
        }}
        {...props}
      />
    </label>
  );
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const phone = normalizePhone(values.phone);
    if (!/^\+234[789]\d{9}$/.test(phone)) {
      setLocalError('Enter a valid Nigerian contact phone number.');
      return;
    }
    if (values.password !== values.confirmPassword) {
      setLocalError("The passwords do not match.");
      return;
    }
    const common = {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      phone,
      ...(values.password ? { password: values.password } : {}),
    };
    const payload = host
      ? {
          ...common,
          businessName: values.businessName.trim() || undefined,
          bankName: values.bankName.trim(),
          bankAccountNumber: values.bankAccountNumber.trim(),
          bankAccountName: values.bankAccountName.trim(),
          bvn: values.bvn.trim(),
        }
      : {
          ...common,
          matricNumber: values.matricNumber.trim(),
          department: values.department.trim(),
          university: "FUTMINNA",
        };
    if (await completeProfile(payload)) onComplete();
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {profile.emailVerifiedAt ? `Email verified: ${profile.email}.` : 'Finish your account details.'} Complete your{" "}
        {host ? "landlord" : "student"} profile below.
      </p>
      <fieldset disabled={isLoading} className="space-y-4 disabled:opacity-60">
        {field("fullName", "Full name", {
          autoComplete: "name",
          pattern: ".*\\S.*",
        })}
        {field("email", "Email address", {
          type: "email",
          autoComplete: "email",
          readOnly: Boolean(profile.emailVerifiedAt),
        })}
        {field("phone", "Contact phone number", { type: 'tel', autoComplete: 'tel', placeholder: '0801 234 5678', maxLength: 24 })}
        <p className="text-xs text-muted-foreground">For booking communication. Adding a number does not verify its ownership.</p>
        {!profile.hasPassword && <>
        {field(
          "password",
          profile.hasPassword ? "New password (optional)" : "Create a password",
          {
            type: "password",
            autoComplete: "new-password",
            minLength: 6,
            required: !profile.hasPassword,
          },
        )}
        {field("confirmPassword", "Confirm password", {
          type: "password",
          autoComplete: "new-password",
          minLength: 6,
          required: Boolean(values.password) || !profile.hasPassword,
        })}
        <p className="text-xs text-muted-foreground">
          Use at least 6 characters. You can then sign in with your email or
          phone and password.
        </p>
        </>}
        {host ? (
          <>
            {field("businessName", "Business or lodge name (optional)", {
              required: false,
            })}
            <div className="border-t border-border pt-4 space-y-1">
              <h3 className="font-semibold">Identity and payout details</h3>
              <p className="text-sm text-muted-foreground">
                These details are reviewed separately. Registration does not
                mean your account is verified or ready for payouts.
              </p>
            </div>
            {field("bankName", "Bank name", {
              maxLength: 100,
              pattern: ".*\\S.*",
            })}
            {field("bankAccountNumber", "Bank account number", {
              inputMode: "numeric",
              pattern: "[0-9]{10}",
              minLength: 10,
              maxLength: 10,
              title: "Enter a 10-digit account number",
              autoComplete: "off",
            })}
            {field("bankAccountName", "Account holder’s name", {
              pattern: ".*\\S.*",
            })}
            {field("bvn", "Bank Verification Number (BVN)", {
              inputMode: "numeric",
              pattern: "[0-9]{11}",
              minLength: 11,
              maxLength: 11,
              title: "Enter your 11-digit BVN",
              autoComplete: "off",
            })}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Campus: FUTMINNA</p>
            {field("matricNumber", "Matriculation number", {
              maxLength: 50,
              pattern: ".*\\S.*",
            })}
            {field("department", "Department", {
              maxLength: 100,
              pattern: ".*\\S.*",
            })}
          </>
        )}
      </fieldset>
      {(localError || error) && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {localError || error}
        </p>
      )}
      <Button type="submit" disabled={isLoading} className="w-full min-h-11">
        {isLoading ? "Saving profile…" : "Finish registration"}
      </Button>
    </form>
  );
}
