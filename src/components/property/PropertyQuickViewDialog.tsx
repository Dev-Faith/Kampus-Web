"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { copyText } from "@/components/account/ui";
import { toast } from "@/lib/stores/useToastStore";
import type { Property } from "@/types/property";
import { getCampusAreaLabel } from "@/lib/constants/campus-areas";
import { listingUrl } from "@/lib/constants/site";
export function PropertyQuickViewDialog({
  property: p,
  isOpen,
  onClose,
}: {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!p) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-4xl overflow-y-auto rounded-3xl border border-border bg-card p-0 text-foreground">
        <DialogHeader className="sr-only">
          <DialogTitle>{p.title}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2">
          <div className="relative min-h-64 bg-muted">
            {p.images[0]?.url ? (
              <Image
                src={p.images[0].url}
                alt={p.title}
                fill
                sizes="(max-width:768px) 90vw, 50vw"
                className="object-cover"
              />
            ) : (
              <p className="p-8">No photos available</p>
            )}
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <p className="text-sm text-brand-strong">
              {getCampusAreaLabel(p.campusArea)} · {p.campus}
            </p>
            <h2 className="text-3xl font-medium">{p.title}</h2>
            <p className="text-muted-foreground">
              {[p.building?.name, p.unitLabel, p.address.street, p.address.city]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="line-clamp-5 whitespace-pre-wrap text-muted-foreground">
              {p.description}
            </p>
            <p className="text-2xl font-semibold">
              {p.currency}
              {p.price.toLocaleString()}{" "}
              <span className="text-sm font-normal">/ year</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {p.images.length} photos · View amenities, house rules, contact
              details and booking options on the full listing.
            </p>
            <Link
              href={`/lodges/${p.id}`}
              onClick={onClose}
              className="block rounded-full bg-primary px-5 py-3 text-center text-primary-foreground"
            >
              View unit & booking options
            </Link>
            <Button
              className="w-full"
              variant="outline"
              onClick={() =>
                void copyText(listingUrl(p.id)).then(
                  (ok) => ok && toast.success("Listing link copied"),
                )
              }
            >
              Share unit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
