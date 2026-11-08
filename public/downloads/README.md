# Publish an Android update

The website serves the APK from its public directory. The download buttons and `/api/app/latest` use `src/lib/constants/android-release.json`. The backend publishes the feed address at `/api/app/update-source`. Set `APP_RELEASE_ORIGIN` on the backend to the official HTTPS website origin. Its initial value is `https://kampus.muyiwa.dev`. When moving the website, publish the same release feed and APK on the new host first, then update this setting and redeploy the backend.

1. In the mobile repository, increase `expo.android.versionCode` for every release and set the user-facing `expo.version`. The first build with update notifications is 1.0.1, code 2.
2. Build an APK for `com.faithadebayo.kampusmobile` with the same signing certificate as the installed application. The existing EAS preview profile builds an APK. Keep control of the release signing key. The currently checked-in 1.0.0 APK uses an Android debug certificate. Moving testers to a different production signing identity needs a separate first install.
3. From the Web repository, run the following with Android SDK Build Tools installed. The script checks the package, increasing build number, signature and certificate before staging anything. Remove `-WhatIf` to copy the APK into `public` and update its release metadata.

   ```powershell
   ./scripts/stage-android-release.ps1 -Apk 'C:\builds\kampus.apk' -WhatIf
   ```

4. Deploy the APK and metadata together. On the public site, confirm that `/api/app/latest` shows the new build number and its `downloadUrl` returns an APK attachment. Allow for the website's five-minute cache.

The signed EAS 1.0.1 APK is 107.5 MiB. For this release, upload the APK to a permanent public download location such as a GitHub Release asset or object storage. Pass that URL to the staging script. It compares the hosted bytes with the local signed APK, then configures the website's download link to redirect there. The EAS internal testing link expires on 20 November 2026. [GitHub file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)

```powershell
./scripts/stage-android-release.ps1 -Apk '../Frontend/dist/android-release/kampus-v1.0.1-build2.apk' -AssetUrl 'https://your-asset-host.example/kampus-v1.0.1-build2.apk' -ReplaceLegacyTestApk
```

The one-time switch replaces the debug certificate baseline. A tester moving from the website's 1.0.0 APK must uninstall it and install the signed 1.0.1 APK. Later releases must match the recorded signing certificate and have a higher build number.

## First install and testing

People running 1.0.0 must install the first update-capable APK from the website. In subsequent builds, Android checks for updates on startup and when the app returns to the foreground. With notification permission, a background task checks the release feed roughly every six hours when Android allows it. A notification tap rechecks the latest build and opens its official download in the browser. Android asks the user to approve installation. If background notifications are disabled, the in-app prompt and **Profile → App updates** still work.

To test the full flow, install a signed, update-capable build on an Android device. Publish a higher-numbered build with the same package and signing certificate in a test environment. Open **App updates**, download it, open the APK, and confirm the installation. Repeat the check after installation to confirm the app reports it is up to date. For the background test, allow notifications and leave the older build in the background. Android controls the exact time of delivery.

Run `node --test scripts/app-updates.test.mjs` from the mobile folder to check release comparison, publisher changes, and unsafe download URLs.
