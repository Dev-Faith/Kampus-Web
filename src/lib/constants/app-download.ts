/**
 * Kampus Mobile App Release Configuration
 * 
 * To release a new version:
 * 1. Drop your new APK into `public/` (e.g. rename to `kampus-v{VERSION}.apk` or replace `public/base.apk`)
 * 2. Update `VERSION` (and `FILE_SIZE` if changed) below.
 * All modal titles, download badges, file names, and showcase CTAs will update automatically.
 */
const VERSION = "1.0.0";
const FILE_SIZE = "89.5 MB";

export const APP_DOWNLOAD_CONFIG = {
  appName: "Kampus",
  version: VERSION,
  versionTag: `v${VERSION}`,
  fullName: `Kampus v${VERSION}`,
  apkFileName: `kampus-v${VERSION}.apk`,
  apkDownloadUrl: `/kampus-v${VERSION}.apk`,
  fileSize: FILE_SIZE,
  platform: "Android 8.0+",
  releasedAt: "October 2026",
};


