# COPYSTAR — existing Realtime Database edition

Start with REALTIME-DATABASE-SETUP.md. Your supplied Firebase config is already in
dist/firebase-downloads.js. The download count uses software_downloads and email
records go under software_emails in raxaul-minute-grocery. Website Hosting remains
raxaul-minute-grocery. No Firebase backend was changed from here.

New: no Cloud Functions dependency. Anonymous Authentication and carefully merged
Realtime Database rules are required before downloads can save records. Preserve
existing grocery rules/data using the included merge helper. Do not reset the counter.

Included: bulk order enquiry forms, scroll-only 3D machine, EmailJS enquiry sending,
original Xerox ZIP, private download emails and an atomic request counter.

Read EMAILJS-SETUP.md to check the receiving inbox. Edit dist/index.html for content,
dist/catalogue-data.js for products, dist/catalogue.js for enquiries,
dist/email-config.js for EmailJS, dist/downloads.js for download UI,
dist/firebase-downloads.js for database connection and dist/app.js/model.js for 3D.

Run npm test for catalogue/model tests. verify-rtdb.mjs tests the database rules on
isolated local emulators only; see the setup guide. Actual browser and live Firebase
integration still need checking after you enable auth and publish the merged rules.

Keep the bundled Three.js license with redistributions. Original software binaries
were copied unchanged, not run or certified. Prices/stock require confirmation.
