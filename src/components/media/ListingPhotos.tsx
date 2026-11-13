"use client";
import { useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload-image";
import { authError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { ErrorNotice } from "@/components/account/ui";
export type ListingPhoto = { url: string; isPrimary: boolean };
export function ListingPhotos({
  value,
  onChange,
  disabled,
  onBusyChange,
}: {
  value: ListingPhoto[];
  onChange: (v: ListingPhoto[]) => void;
  disabled?: boolean;
  onBusyChange: (v: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [progress, setProgress] = useState("");
  async function pick(files: File[]) {
    if (!files.length) return;
    setError("");
    if (files.length + value.length > 10) {
      setError("Choose up to 10 photos in total.");
      return;
    }
    setBusy(true);
    onBusyChange(true);
    let next = [...value];
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading photo ${i + 1} of ${files.length}…`);
        const url = await uploadImage(files[i]);
        next = [...next, { url, isPrimary: next.length === 0 }];
        onChange(next);
      }
    } catch (e) {
      setError(
        authError(
          e,
          "Photo upload failed. Successfully uploaded photos have been kept.",
        ),
      );
    } finally {
      setBusy(false);
      onBusyChange(false);
      setProgress("");
    }
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add up to 10 clear photos of this unit, its bathroom and the compound.
        Choose one cover photo. JPG, PNG or WebP; up to 10 MB each.
      </p>
      <label className="block rounded-2xl border border-dashed border-border bg-muted p-5">
        <span className="mb-3 block font-medium">Add photos</span>
        <input
          aria-label="Listing photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || disabled || value.length >= 10}
          className="w-full text-sm"
          onChange={(e) => {
            void pick(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </label>
      {progress && <p role="status">{progress}</p>}
      <ErrorNotice error={error} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((photo, i) => (
          <div
            key={photo.url}
            className="overflow-hidden rounded-2xl border border-border"
          >
            <div className="relative aspect-square bg-muted">
              <Image
                unoptimized
                src={photo.url}
                fill
                sizes="240px"
                alt={`Unit photo ${i + 1}`}
                className="object-cover"
              />
            </div>
            <div className="flex flex-wrap gap-2 p-2">
              <Button
                size="sm"
                variant={photo.isPrimary ? "default" : "outline"}
                disabled={busy || disabled}
                onClick={() =>
                  onChange(value.map((p, j) => ({ ...p, isPrimary: j === i })))
                }
              >
                {photo.isPrimary ? "Cover photo" : "Set cover"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy || disabled}
                onClick={() => {
                  const remaining = value.filter((_, j) => i !== j);
                  onChange(
                    remaining.map((p, j) => ({
                      ...p,
                      isPrimary: photo.isPrimary ? j === 0 : p.isPrimary,
                    })),
                  );
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
