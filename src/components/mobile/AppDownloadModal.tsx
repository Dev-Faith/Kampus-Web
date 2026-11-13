"use client";

import React, { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { APP_DOWNLOAD_CONFIG } from "@/lib/constants/app-download";
import { toast } from "@/lib/stores/useToastStore";
import { KampusLogo } from "@/components/brand/KampusLogo";
import { WEBSITE_URL } from "@/lib/constants/site";
import { copyText } from "@/components/account/ui";

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppDownloadModal({ isOpen, onClose }: AppDownloadModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const fullUrl = WEBSITE_URL + APP_DOWNLOAD_CONFIG.apkDownloadUrl;
    if (!(await copyText(fullUrl))) return;
    setCopied(true);
    toast.success("Download link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[360px] p-6">
        <DialogTitle className="sr-only">
          {APP_DOWNLOAD_CONFIG.fullName} Download
        </DialogTitle>
        <div className="flex flex-col items-center text-center space-y-4 pt-1">
          {/* App Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-ink-solid">
            <KampusLogo variant="mark" size={44} markClassName="text-white" />
          </div>

          {/* Title & Metadata */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center justify-center gap-2">
              <span>{APP_DOWNLOAD_CONFIG.appName}</span>
              <span className="text-[11px] font-mono font-medium text-brand-strong bg-brand-soft px-2 py-0.5 rounded-full border border-brand/25">
                {APP_DOWNLOAD_CONFIG.versionTag}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {APP_DOWNLOAD_CONFIG.fileSize} &bull;{" "}
              {APP_DOWNLOAD_CONFIG.platform}
            </p>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">
            Search verified lodges, keep your inspection details handy, and
            manage booking updates on the go.
          </p>

          {/* Actions */}
          <div className="w-full pt-1 space-y-2">
            <a
              href={APP_DOWNLOAD_CONFIG.apkDownloadUrl}
              download={APP_DOWNLOAD_CONFIG.apkFileName}
              className="block w-full"
            >
              <Button className="editorial-action w-full h-11 font-semibold text-xs flex items-center justify-center gap-2">
                <Download className="h-4 w-4 stroke-[2.5]" />
                <span>
                  Download {APP_DOWNLOAD_CONFIG.appName}{" "}
                  {APP_DOWNLOAD_CONFIG.versionTag} (
                  {APP_DOWNLOAD_CONFIG.fileSize})
                </span>
              </Button>
            </a>

            <Button
              type="button"
              variant="ghost"
              onClick={handleCopyLink}
              className="w-full h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-success" />
                  <span className="text-success font-medium">Link copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy download link</span>
                </>
              )}
            </Button>
          </div>

          {/* Helper Note */}
          <p className="text-[11px] text-muted-foreground pt-1">
            Tap the downloaded file in your browser to install. Requires Android
            8.0+.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
