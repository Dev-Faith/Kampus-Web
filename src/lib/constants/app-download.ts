import release from "./android-release.json";

// Shared by the website download buttons and the Android release feed.
export const APP_DOWNLOAD_CONFIG = {
  ...release,
  appName: "Kampus",
  versionTag: "v" + release.version,
  fullName: "Kampus v" + release.version,
  apkDownloadUrl: "/" + release.apkFileName,
  platform: "Android 8.0+",
};
