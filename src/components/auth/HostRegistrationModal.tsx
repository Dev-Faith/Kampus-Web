"use client";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileSetup } from "./ProfileSetup";

export function HostRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { user, logout, isLoading } = useAuthStore();
  const host = user?.role === "LANDLORD";
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogContent
        className="p-5 sm:p-7 overflow-y-auto"
        showCloseButton={!isLoading}
      >
        <DialogTitle className="pr-7 text-xl font-bold">
          {host ? "Complete your landlord profile" : "Use a landlord account"}
        </DialogTitle>
        <DialogDescription>
          {host
            ? "Finish your registration to manage your rental units."
            : "Student and landlord accounts are separate. Your student account will stay unchanged."}
        </DialogDescription>
        {host ? (
          isOpen && (
            <ProfileSetup
              onComplete={() => {
                onClose();
                onSuccess?.();
              }}
            />
          )
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Sign out, then sign in to your landlord account or create one with
              a different phone number and email.
            </p>
            <Button
              onClick={() => {
                logout();
                window.location.assign("/host/dashboard?register=1");
              }}
            >
              Sign out and continue as landlord
            </Button>
            <Button variant="outline" onClick={onClose}>
              Keep my current account
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
