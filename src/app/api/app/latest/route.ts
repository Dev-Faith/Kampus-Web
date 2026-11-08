import { NextResponse } from "next/server";
import { APP_DOWNLOAD_CONFIG } from "@/lib/constants/app-download";

export async function GET() {
  return NextResponse.json(
    {
      appName: APP_DOWNLOAD_CONFIG.appName,
      version: APP_DOWNLOAD_CONFIG.version,
      versionCode: APP_DOWNLOAD_CONFIG.versionCode,
      packageName: APP_DOWNLOAD_CONFIG.packageName,
      versionTag: APP_DOWNLOAD_CONFIG.versionTag,
      fullName: APP_DOWNLOAD_CONFIG.fullName,
      fileSize: APP_DOWNLOAD_CONFIG.fileSize,
      downloadUrl: APP_DOWNLOAD_CONFIG.apkDownloadUrl,
      platform: APP_DOWNLOAD_CONFIG.platform,
      releasedAt: APP_DOWNLOAD_CONFIG.releasedAt,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}
