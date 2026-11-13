"use client";
import { useState, type FormEvent } from "react";
import { AccountPage } from "@/components/account/AccountPage";
import {
  Panel,
  ErrorNotice,
  Loading,
  inputClass,
} from "@/components/account/ui";
import { useApiResource } from "@/lib/use-api-resource";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { authError } from "@/lib/auth-errors";
import type { LandlordProfile } from "@/types/api";
export default function Page() {
  return (
    <AccountPage
      title="Payout details"
      description="The account where your approved landlord payouts are sent."
      roles={["LANDLORD"]}
    >
      <Payouts />
    </AccountPage>
  );
}
function Payouts() {
  const { data, error, reload } =
    useApiResource<LandlordProfile>("/landlords/profile");
  return (
    <>
      <ErrorNotice error={error} retry={reload} />
      {data ? (
        <BankForm key={data.id} profile={data} reload={reload} />
      ) : (
        !error && <Loading />
      )}
    </>
  );
}
function BankForm({
  profile: p,
  reload,
}: {
  profile: LandlordProfile;
  reload: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      str = (k: string) => String(f.get(k) || "").trim();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await apiClient.put("/landlords/profile", {
        fullName: p.fullName,
        email: p.email,
        bankName: str("bankName"),
        bankAccountName: str("bankAccountName"),
        ...(str("bankAccountNumber")
          ? { bankAccountNumber: str("bankAccountNumber") }
          : {}),
        ...(str("bvn") ? { bvn: str("bvn") } : {}),
        ...(str("businessRegistration")
          ? { businessRegistration: str("businessRegistration") }
          : {}),
      });
      setSaved(true);
      reload();
    } catch (e) {
      setError(authError(e, "Couldn’t save your payout details."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="max-w-3xl space-y-6">
      <Panel>
        <h2 className="text-xl font-semibold">Current account</h2>
        <p>
          {p.bankName || "No bank added"} ·{" "}
          {p.bankAccountNumber || "No account number"}
        </p>
        <p>{p.bankAccountName}</p>
        <p>
          Verification status: <strong>{p.kycStatus || "PENDING"}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Saving bank details does not verify ownership or release a payout.
          Changing these details may require a new review.
        </p>
      </Panel>
      <Panel>
        <h2 className="text-xl font-semibold">Update payout account</h2>
        <form
          className="space-y-4"
          onSubmit={submit}
          onChange={() => setSaved(false)}
        >
          <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
            <label>
              Bank name or bank code
              <input
                name="bankName"
                required
                maxLength={100}
                defaultValue={p.bankName || ""}
                className={inputClass}
              />
            </label>
            <label>
              Account holder name
              <input
                name="bankAccountName"
                required
                maxLength={255}
                defaultValue={p.bankAccountName || ""}
                className={inputClass}
              />
            </label>
            <label className="sm:col-span-2">
              Account number{" "}
              {p.bankAccountNumber && "(leave blank to keep current account)"}
              <input
                name="bankAccountNumber"
                inputMode="numeric"
                autoComplete="off"
                pattern="[0-9]{10}"
                minLength={10}
                maxLength={10}
                required={!p.bankAccountNumber}
                className={inputClass}
              />
            </label>
            <label>
              BVN (optional, 11 digits)
              <input
                name="bvn"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                pattern="[0-9]{11}"
                minLength={11}
                maxLength={11}
                className={inputClass}
              />
            </label>
            <label>
              Business registration (optional)
              <input
                name="businessRegistration"
                maxLength={100}
                defaultValue={p.businessRegistration || ""}
                className={inputClass}
              />
            </label>
          </fieldset>
          <ErrorNotice error={error} />
          {saved && (
            <p role="status" className="text-success">
              Payout details saved.
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save payout details"}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
