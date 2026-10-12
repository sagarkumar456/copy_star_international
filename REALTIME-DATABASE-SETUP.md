# COPYSTAR software downloads — existing Realtime Database

The new code uses the exact Firebase web config you supplied:
- Database/Auth project: raxaul-minute-grocery
- Database: raxaul-minute-grocery-default-rtdb (asia-southeast1)
- Website Hosting: raxaul-minute-grocery (same project)

No Cloud Functions, Firestore or Cloud Storage is used by the download flow in this
version. The original ZIP is served from Firebase Hosting. This removes the former
Cloud Functions Blaze requirement. Usage quotas and the project's current plan still
apply; the 33 MB ZIP uses Hosting bandwidth each time it is downloaded.

## 1. Enable anonymous sign-in in the DATABASE project

Open https://console.firebase.google.com/project/raxaul-minute-grocery/authentication/providers
Choose Authentication > Sign-in method > Anonymous > Enable > Save.
Visitors do not see a login screen. Each browser receives a private Firebase user ID.

Check Authentication > Settings > Authorized domains. Add your actual website domains:
- raxaul-minute-grocery.web.app
- raxaul-minute-grocery.firebaseapp.com
- localhost (for local preview)
- Your custom domain, if used

If your existing API key has HTTP referrer restrictions, allow these website origins
in its Google Cloud API key settings too. Keep restrictions scoped to your sites.
This package uses a named Firebase app so it does not replace another app instance.

## 2. Safely merge database rules

Open the raxaul-minute-grocery project > Realtime Database > Rules.
First save a copy of your EXISTING rules as existing-rules.json in this project folder.
Do not use the Data export here: the script needs rules, not customer data.

Run:

```sh
node merge-database-rules.mjs existing-rules.json
```

Review database.rules.merged.json. It preserves unrelated nodes (such as cod_orders)
and replaces only rules for these software paths:
- software_downloads: public count, validated writes only.
- software_emails: existing data retained; new entries under visitor UID/request ID.
- software_download_meta: private atomic-write metadata.
- software_download_limits: visitor cooldown timestamps.

Paste the reviewed merged rules into the same database's Rules tab and Publish.
If your JSON has comments, remove them in the local copy before running the script.
If your root .read or .write grants access, the script stops: child rules cannot revoke
parent access. Share your current rules for a safe merge that preserves grocery access.
Never solve an error by setting root .read or .write to true.

Existing broad root wildcard rules or ancestor .validate conditions also need review:
this script cannot prove arbitrary existing rules are safe. Test with the Rules
Playground or emulators before publishing. The test rules file is for an isolated
emulator ONLY; do not replace your existing database rules with it.

Existing Flutter code that writes these software nodes without the new atomic payload
will need updating if it is still active. This package updates the HTML website only.

## 3. Run or deploy the website

Extract into a new folder and open it in VS Code. No functions dependency install is
needed. For local preview using the REAL database (after rules and auth setup):

```sh
npx --yes --package firebase-tools@latest firebase emulators:start --only hosting --project raxaul-minute-grocery
```

Open http://localhost:5050. Test submissions here write REAL database records.
To publish the website:

```sh
npx --yes --package firebase-tools@latest firebase deploy --only hosting --project raxaul-minute-grocery
```

This deploy command does not publish database rules. It updates the default Hosting site in raxaul-minute-grocery; if that site already hosts another app, its website files will be replaced.
Do not use the old functions/firestore deploy command for this package.

## 4. Confirm the flow

Choose Xerox > Download > enter email > Download ZIP.
The email and count are saved together before the browser starts the ZIP download.
There is no success popup. Other brands show "Software is not available yet."

Check the grocery project's Realtime Database:
- software_downloads: reads the existing number and increments it; never resets to zero.
  Your screenshot showed 52. If it is still 52, the next accepted request makes it 53.
- software_emails / visitor UID / request ID: email, brand, createdAt (milliseconds).
- software_download_meta and software_download_limits: private bookkeeping.

A repeat request ID is not counted again. Each visitor UID has a one-minute cooldown.
A new browser/cleared identity can bypass this basic cooldown; this is not strong bot
protection. A valid email format does not prove ownership of the address. Use Firebase
App Check if you need additional abuse protection; it is not configured in this package.

The count tracks accepted requests, not completed file transfers. A direct ZIP link
can bypass the form and count. The ZIP is intentionally a public Hosting asset.
The UI never downloads if the email/count write fails. Existing software_emails data
is not deleted or migrated. It will keep its original shape alongside new UID records.

Emails are readable in Firebase Console by project admins. Visitors can read only
their own exact request paths, not other people's emails or the email collection.
Anonymous sign-in is only used for access control; no password or marketing signup.

## Isolated emulator tests

For local rules testing, use a demo project, not either live project:

```sh
npx --yes --package firebase-tools@latest firebase emulators:exec --config firebase.emulators.json --only auth,database --project demo-copystar "node verify-rtdb.mjs"
```

Use the Java version requested by your Firebase CLI. The test writes only to localhost.
The browser can use emulators with ?firebaseEmulators=1 on localhost after starting
Hosting, Auth and Database together with firebase.emulators.json. Production ignores
that flag. Emulator data is separate and does not change the existing 52 count.

## Existing features

Bulk quotes, product enquiries and service forms still send through EmailJS. Check
EMAILJS-SETUP.md for the receiving inbox. The machine animation remains scroll-only.
The software email/count flow now uses Realtime Database rather than the previous
Cloud Functions / Firestore implementation. No live project changes were made here.
