"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProfileSetup } from "./ProfileSetup";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { authApi } from "@/api/auth";
import { normalizePhone } from "@/lib/auth-errors";
import { UserRole } from "@/types/api";
import { toast } from "@/lib/stores/useToastStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  defaultMode?: "signin" | "signup";
}
const inputClass = "mt-1 w-full min-h-11 rounded-xl border border-border bg-background px-3 py-2 text-base text-foreground";
type Challenge = { requestId: string; expiresAt: number; resendAt: number };

export function AuthModal({ isOpen, onClose, defaultRole = "STUDENT", defaultMode = "signin" }: AuthModalProps) {
  const isLoading = useAuthStore((state) => state.isLoading);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !useAuthStore.getState().isLoading) onClose(); }}>
      <DialogContent className="max-w-lg p-5 sm:p-7 overflow-y-auto" showCloseButton={!isLoading}>
        {isOpen && <AuthFlow key={defaultRole + defaultMode} onClose={onClose} defaultRole={defaultRole} defaultMode={defaultMode} />}
      </DialogContent>
    </Dialog>
  );
}

function AuthFlow({ onClose, defaultRole, defaultMode }: Required<Omit<AuthModalProps, "isOpen">>) {
  const router = useRouter();
  const { user, isAuthenticated, login, sendOtp, resendOtp, verifyOtp, isLoading, error, clearError } = useAuthStore();
  const [role, setRole] = useState<UserRole>(defaultRole === "LANDLORD" ? "LANDLORD" : "STUDENT");
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [status, setStatus] = useState<Awaited<ReturnType<typeof authApi.registrationStatus>> | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  const [statusAttempt, setStatusAttempt] = useState(0);
  const [localError, setLocalError] = useState("");
  const needsProfile = isAuthenticated && user?.role !== "ADMIN" && (user?.profileStatus !== "COMPLETED" || user?.hasPassword === false);

  useEffect(() => { clearError(); }, [clearError]);
  useEffect(() => {
    let active = true;
    authApi.registrationStatus().then((value) => {
      if (active) { setStatus(value); setStatusFailed(false); }
    }).catch(() => { if (active) setStatusFailed(true); });
    return () => { active = false; };
  }, [statusAttempt]);
  useEffect(() => {
    if (!challenge) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [challenge]);

  function resetCode() { setChallenge(null); setCode(""); setPassword(""); setConfirmPassword(""); setLocalError(""); clearError(); }
  function finish() {
    toast.success("You’re all set");
    const accountRole = useAuthStore.getState().user?.role;
    onClose();
    if (accountRole === "LANDLORD") router.push("/host/dashboard");
  }
  function afterAuthentication() {
    const account = useAuthStore.getState().user;
    if (account?.profileStatus === "COMPLETED" && account.hasPassword !== false) finish();
  }
  async function requestCode() {
    setLocalError("");
    if (!challenge && password !== confirmPassword) { setLocalError("The passwords do not match."); return; }
    const normalized = email.trim().toLowerCase();
    const result = challenge ? await resendOtp(normalized, challenge.requestId) : await sendOtp(normalized, password, role);
    if (result) {
      setEmail(normalized); setCode(""); setPassword(""); setConfirmPassword(""); setNow(Date.now());
      setChallenge({ requestId: result.requestId, expiresAt: Date.now() + result.expiresIn * 1000, resendAt: Date.now() + (result.resendAfterSeconds ?? 60) * 1000 });
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (mode === "signin") {
      const identity = emailOrPhone.includes("@") ? emailOrPhone.trim().toLowerCase() : normalizePhone(emailOrPhone);
      if (await login(identity, password, role)) afterAuthentication();
    } else if (!challenge) await requestCode();
    else if (await verifyOtp(email, code, challenge.requestId)) afterAuthentication();
  }
  const expired = Boolean(challenge && now >= challenge.expiresAt);
  const resendSeconds = challenge ? Math.max(0, Math.ceil((challenge.resendAt - now) / 1000)) : 0;

  return (
    <>
      <div className="pr-7 space-y-2">
        <DialogTitle className="text-xl font-bold">{needsProfile ? "Complete your profile" : mode === "signup" ? "Create your Kampus account" : "Welcome to Kampus"}</DialogTitle>
        <DialogDescription>{needsProfile ? "Add your contact and profile details to finish." : "Find a place near campus or manage your rental units."}</DialogDescription>
      </div>
      {needsProfile ? <ProfileSetup onComplete={finish} /> : <>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1" aria-label="Account access">
          {(["signin", "signup"] as const).map((value) => <Button key={value} type="button" variant={mode === value ? "default" : "ghost"} disabled={isLoading} aria-pressed={mode === value} onClick={() => { setMode(value); resetCode(); }}>{value === "signin" ? "Sign in" : "Create account"}</Button>)}
        </div>
        <fieldset disabled={isLoading || Boolean(challenge)} className="space-y-2">
          <legend className="text-sm font-medium mb-2">{mode === "signup" ? "I’m joining as a" : "Account type"}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["STUDENT", "LANDLORD"] as const).map((value) => <Button key={value} type="button" variant={role === value ? "default" : "outline"} aria-pressed={role === value} onClick={() => { setRole(value); resetCode(); }}>{value === "STUDENT" ? "Student" : "Landlord"}</Button>)}
          </div>
        </fieldset>
        {mode === "signup" && <p className="text-xs text-muted-foreground">1. Email and password · 2. Verify email · 3. Complete profile<br />Student and landlord accounts are separate. Each needs its own email and contact number.</p>}
        {mode === "signup" && !status?.emailVerificationAvailable && <div role="status" className="rounded-xl border border-border bg-muted/50 p-3 text-sm">
          {status ? (status.verificationMethod === 'email' ? status.message : 'Email registration is being enabled. Existing users can sign in with their password.') : statusFailed ? "We couldn’t check email verification availability. Please try again." : "Checking email verification availability…"}
          {statusFailed && <Button className="mt-2" variant="outline" onClick={() => { setStatusFailed(false); setStatusAttempt(statusAttempt + 1); }}>Retry availability check</Button>}
        </div>}
        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={isLoading} className="space-y-4 disabled:opacity-60">
            {mode === "signup" ? challenge ? <>
              <p className="text-sm text-muted-foreground">Enter the six-digit code sent to <strong className="break-all">{email}</strong>. Check your spam folder too.</p>
              <label className="block text-sm font-medium">Verification code<input name="otp" className={inputClass + " tracking-[0.3em]"} value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError(); }} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required autoFocus /></label>
              <p className="text-xs text-muted-foreground" role="status">{expired ? "This code has expired. Request a new one." : `Code expires in ${Math.max(0, Math.ceil((challenge.expiresAt - now) / 60000))} minute(s).`}</p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" disabled={resendSeconds > 0} onClick={requestCode}>{resendSeconds ? `Resend in ${resendSeconds}s` : "Resend code"}</Button>
                <Button type="button" variant="ghost" onClick={resetCode}>Change email or account type</Button>
              </div>
            </> : <>
              <label className="block text-sm font-medium">Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" className={inputClass} required maxLength={255} value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} /></label>
              <label className="block text-sm font-medium">Create a password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
              <label className="block text-sm font-medium">Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={72} required className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
              <p className="text-xs text-muted-foreground">Use at least 8 characters. You’ll use this password to sign in after registration.</p>
            </> : <>
              <label className="block text-sm font-medium">Email or phone number<input name="emailOrPhone" autoComplete="username" required className={inputClass} value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} /></label>
              <label className="block text-sm font-medium">Password<input name="password" type="password" autoComplete="current-password" required className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            </>}
          </fieldset>
          {(error || localError) && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{localError || error}</p>}
          <Button type="submit" className="w-full min-h-11" disabled={isLoading || (mode === "signup" && (!challenge ? !status?.emailVerificationAvailable : code.length !== 6 || expired))}>
            {isLoading ? "Please wait…" : mode === "signin" ? "Sign in with password" : challenge ? "Verify email and continue" : "Send verification email"}
          </Button>
        </form>
      </>}
    </>
  );
}
