# Mobile and web capability audit

Implemented in the Web, Backend/kampus-backend, and Frontend working trees on 13 November 2026. Deploy the backend and web together. No database migration is required by this change.

## Account and role coverage

| Capability in the mobile product | Web location / implementation |
| --- | --- |
| Student or landlord registration, email verification, resend, password sign-in, onboarding, logout | Existing Join / Sign in modal; separate account roles remain enforced |
| Profile photo, name, contact number, student academic details, landlord business name | /settings; uploads a compressed JPEG to Cloudinary, then persists its HTTPS URL |
| Appearance | Header and /settings theme controls |
| Notifications and unread count | Header bell and /notifications; mark one or all read, booking and roommate links, polling and focus refresh |
| Browse/search units, campus area, unit type, rent, amenities, distance, sorting | /explore; database amenities, URL filters, paginated results, grid and map views |
| Unit photos, amenities, house rules, location, contact landlord, sharing | /lodges/[id]; gallery, maps link, phone/WhatsApp and permanent sharing URL |
| Save and remove saved units | Listing hearts, unit details and /saved-lodges; account-scoped saved state |
| Reservation date, special requests, price review | Unit detail reservation form; payment is a separate step |
| Active and historical student bookings | /bookings; server filtering before pagination, explicit load errors |
| Booking details, payment, test payment, refund status | /bookings/[id]; provider checkout and explicit dummy-payment confirmation |
| Inspection code and deadline, paid one-day extensions | Booking details; uses server eligibility flags and the existing maximum four extensions |
| Cancellation and reporting a problem | Booking details; confirms cancellation, captures reason, displays dispute status |
| Roommate posts, filters, introductions, accept/decline/close, private messaging, pause/republish | Existing /roommates flow; notification links now open the relevant request |
| Landlord metrics | /host/dashboard; reservations, occupied units and confirmed earnings shown separately |
| Create and edit a building's rentable units | /host/properties, /host/properties/new, /host/properties/[id] |
| Listing photos, cover photo, amenities, room count, capacity, rules and availability date | Unit editor; actual Cloudinary uploads, partial upload recovery, persisted image URLs |
| Manual unit availability and deletion | Unit editor; backend prevents overriding active reservations/unsettled payments, and prevents deleting any booking history |
| Landlord booking requests, student contacts, accept/decline | /host/bookings; refreshes confirmed server state and preserves errors |
| Verify student inspection code | Landlord booking details; code is never disclosed to the landlord, incorrect codes do not advance state |
| Landlord bank and verification details | /host/payouts; account numbers remain masked, blank replacement values preserve existing data |
| Administration | Existing /admin portal; account permissions unchanged |

Native fingerprint prompts and Android APK updates are device-specific. Web users sign in through the browser and receive the current website when it loads. The website does not require an APK or app-store installation. Mobile placeholder help/privacy alerts are not treated as completed backend features.

## Backend changes

- Authenticated saved-unit status and minimal saved-ID endpoints.
- Landlord booking details return student contact details only after ownership checks. Student inspection codes remain excluded from landlord responses.
- Landlord property detail returns rules and availableFrom so edits preserve them.
- Availability DTO accepts the mobile lowercase values and canonical uppercase enum; status changes lock the unit and check reservations/payments before writing.
- Deletion locks the unit and refuses to cascade away any booking history.
- Profile updates support photo replacement/removal without resetting an omitted photo.

## Validation

- Web production build and TypeScript.
- Lint of changed TypeScript files.
- Backend profile/registration/booking regression checks and web-parity tests for ownership, private inspection codes, saved-unit scoping, availability validation and deletion safety.
- Mobile profile-photo regression checks (6 passing), TypeScript, and an Android production JavaScript export. This is not a signed APK release.
- Browser integration fixtures: student reservation, simulated payment, history, cancellation, dispute, extension; landlord failed/successful acceptance and inspection verification; listing upload failure/retry and edit; payout save; profile photo persistence; unread count; role guard; search pagination and mobile/desktop layout.
- Existing roommate and registration browser checks passed, including direct signup from the landlord dashboard and student bookings page, interrupted onboarding, and separate account roles.

Browser tests intercept backend and Cloudinary requests with fixtures; they do not create hosted bookings, send verification emails, or move money. Real provider settlement and native Android upload behavior still need device/provider acceptance testing after deployment.

## Release status

The changes are local and have not been deployed. Deploy the backend before the web so that saved-unit state, property editing, and landlord booking details use the updated API. Existing environment variables are reused; no schema migration is required. Publish a new mobile build to distribute the native profile-photo fixes.

After deployment, use test accounts to verify one student reservation and payment through inspection approval, a separate cancellation/dispute scenario, and a landlord listing with real photos. Confirm the saved profile photo on an Android device. These hosted checks complement the automated fixture tests; they have not been run against real payments.

Run browser checks with the built website on localhost:3000:

```powershell
node scripts/account-parity-ui-check.cjs
node scripts/roommates-ui-check.cjs
node scripts/registration-ui-check.cjs
```

