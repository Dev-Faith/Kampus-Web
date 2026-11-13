"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PhotoDraft = { file: File | null; url: string };
export function ProfilePhotoField({
  value,
  onChange,
  disabled,
}: {
  value: PhotoDraft;
  onChange: (value: PhotoDraft) => void;
  disabled: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const url = value.url;
    return () => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    };
  }, [value.url]);
  function select(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose a photo smaller than 10 MB.");
      return;
    }
    setError("");
    onChange({ file, url: URL.createObjectURL(file) });
  }
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-muted/50 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-brand-soft text-brand-strong">
          {value.url ? (
            <Image
              unoptimized
              src={value.url}
              alt="Profile photo preview"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <UserRound className="h-8 w-8" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-medium">
            Profile photo{" "}
            <span className="text-sm font-normal text-muted-foreground">
              (optional)
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => input.current?.click()}
            >
              <Camera className="h-4 w-4" />{" "}
              {value.url ? "Change photo" : "Add photo"}
            </Button>
            {value.url && (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                onClick={() => {
                  setError("");
                  onChange({ file: null, url: "" });
                }}
              >
                Remove photo
              </Button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={input}
        type="file"
        aria-label="Choose profile photo"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          select(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-muted-foreground">
        JPG, PNG or WebP, up to 10 MB. Your photo updates when you save.
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
