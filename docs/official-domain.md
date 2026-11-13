# Official website domain

The public address is https://kampus.homes. Its current hosting configuration redirects to https://www.kampus.homes, so metadata, copied download links, and listing share URLs use that final origin. Mobile shares now use the website's actual `/lodges/[id]` route.

## Backend deployment settings

Set these environment variables on the backend hosting project, then redeploy:

```dotenv
APP_RELEASE_ORIGIN=https://www.kampus.homes
PAYMENT_REDIRECT_URL=https://www.kampus.homes/payment/callback
CORS_ORIGIN=https://www.kampus.homes
```

`APP_RELEASE_ORIGIN` must be the final origin without a path. The mobile updater intentionally rejects release feeds that redirect to another origin. The backend's source-code default has been updated, but an existing environment variable overrides it. Existing update-capable app installations discover the release location through the backend; they do not need rebuilding just to change the feed address.

The API remains at `https://kampus-backend.vercel.app/api`. Do not point API clients or the Flutterwave webhook to the website: the website and backend are separate services. This domain change does not enable live payments or change payment mode.

Deploy the web changes for metadata and copied links. Distribute a new mobile build for the corrected listing share link. The Android APK version and signing identity are unchanged by this change.

## Checks performed on 13 November 2026

- The new website and `/api/app/latest` respond successfully on the `www` host.
- The bare domain redirects to `www`; use the final host for the app release feed.
- The deployed backend accepts browser preflights from both the bare and `www` domains.
- Before deployment of these source changes, `/api/app/update-source` still advertised `https://kampus.muyiwa.dev/api/app/latest`. Verify it returns `https://www.kampus.homes/api/app/latest` after updating hosting settings and redeploying.

The existing verified email sender is preserved. Using an email address on the new domain requires separately verifying its DNS records with the email provider before changing the sender configuration.
