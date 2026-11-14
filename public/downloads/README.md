# Publish an Android update

The complete user flow, verification record, release checklist and troubleshooting
guide is in the mobile repository's `ANDROID_UPDATES.md` (the sibling
`Frontend/ANDROID_UPDATES.md` in the Kampus workspace).

As checked on 14 November 2026, the public feed still serves 1.0.0 / build 1.
Mobile source is prepared for 1.0.2 / build 3 with a dismissible in-app banner;
that new signed APK must be built and tested before updating this feed.

The website serves the APK from its public directory. The download buttons and `/api/app/latest` use `src/lib/constants/android-release.json`. The backend publishes the feed address at `/api/app/update-source`. Set `APP_RELEASE_ORIGIN=https://www.kampus.homes` on the backend and redeploy it. Use the final `www` origin because `kampus.homes` redirects there and the mobile updater rejects cross-origin feed redirects. When moving the website, publish the same release feed and APK on the new host first, then update this setting and redeploy the backend.

1. In the mobile repository, increase `expo.android.versionCode` for every release and set the user-facing `expo.version`. The first build with update notifications is 1.0.1, code 2.
2. Build an APK for `com.faithadebayo.kampusmobile` with the same signing certificate as the installed application. The existing EAS preview profile builds an APK. Keep control of the release signing key. The currently checked-in 1.0.0 APK uses an Android debug certificate. Moving testers to a different production signing identity needs a separate first install.
3. From the Web repository, run the following with Android SDK Build Tools installed. The script checks the package, increasing build number, signature and certificate before staging anything. Remove `-WhatIf` to copy the APK into `public` and update its release metadata.

   ```powershell
   ./scripts/stage-android-release.ps1 -Apk 'C:\builds\kampus.apk' -WhatIf
   ```

4. Deploy the APK and metadata together. On the public site, confirm that `/api/app/latest` shows the new build number and its `downloadUrl` returns an APK attachment. Allow for the website's five-minute cache.

The existing signed EAS 1.0.1 APK is 107.5 MiB. Upload large APKs to a permanent public download location such as a GitHub Release asset or object storage. Pass that URL to the staging script. It compares the hosted bytes with the local signed APK, then configures the website's download link to redirect there. Do not use an expiring EAS internal testing link. [GitHub file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)

```powershell
./scripts/stage-android-release.ps1 -Apk '../Frontend/dist/android-release/kampus-v1.0.2-build3.apk' -AssetUrl 'https://your-asset-host.example/kampus-v1.0.2-build3.apk' -ReplaceLegacyTestApk -WhatIf
```

Use that example only after the matching APK is built and uploaded. Remove `-WhatIf` after reviewing the validation. The one-time switch replaces the debug certificate baseline with the verified signed build-2 certificate. A tester moving from the website's 1.0.0 APK must uninstall it and install the signed release. Save unsaved drafts first: uninstalling clears local data. Users already on signed build 2 should update in place. Later releases must match the recorded signing certificate and have a higher build number; omit `-ReplaceLegacyTestApk` for them.

## First install and testing

People running 1.0.0 must install an update-capable signed APK from the website. Current source checks on startup, foreground return and every five minutes while active, showing a banner with Download update and Later. Signed build 2 has the older automatic alert instead. With notification permission, a background task requests checks with a six-hour minimum interval, when Android allows it. This is periodic local notification delivery, not instant server push. A notification tap rechecks the latest build and opens its official download in the browser. Android asks the user to approve installation. If background notifications are disabled, the in-app notice and **Profile → App updates** still work.

To test the full flow, install a signed, update-capable build on an Android device. Publish a higher-numbered build with the same package and signing certificate in a test environment. Open **App updates**, download it, open the APK, and confirm the installation. Repeat the check after installation to confirm the app reports it is up to date. For the background test, allow notifications and leave the older build in the background. Android controls the exact time of delivery.

Run `node --test scripts/app-updates.test.mjs` from the mobile folder to check release comparison, publisher changes, and unsafe download URLs.
