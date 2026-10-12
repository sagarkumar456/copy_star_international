# EmailJS setup

Product enquiries, bulk order quotes and service requests now use EmailJS on form
submission. The software download email flow remains in Firebase and is unchanged.

Your supplied service ID, template ID and PUBLIC key are configured in
dist/email-config.js. No private API key is required or included.

## Check your template before launch

Open https://dashboard.emailjs.com/ and edit template_fjzrtba.

- To Email: set the inbox that must receive every message. For the existing COPYSTAR
  business contact this is Copystarnepal@hotmail.com. Confirm that this is the inbox
  you want; this cannot be inferred from the public key and has not been changed here.
- Reply-To: {{from_email}}
- Subject: COPYSTAR enquiry — {{from_name}}
- Body: include {{from_name}}, {{from_email}}, {{phone_number}} and {{message}}.
  The message field contains all product, bulk quantity, delivery and service details.
- Use normal escaped template variables, not unescaped HTML, for visitor input.
- Confirm service_y64js2r is connected to a working email service.
- In your origin allowlist include your actual Hosting domains and local preview:
  https://raxaul-minute-grocery.web.app
  https://raxaul-minute-grocery.firebaseapp.com
  http://localhost:5050
  Add your custom domain when it is connected.

The browser supplies its real Origin header. Do not manually force localhost.
If your template has CAPTCHA enabled, add its frontend widget/token before using
this integration. No CAPTCHA site key was supplied in this conversation.

## Deploy

This adds no new Firebase backend dependency for email. If your previous download
backend is already deployed, install nothing and deploy the frontend:

npx --yes --package firebase-tools@latest firebase deploy --only hosting --project raxaul-minute-grocery

Software downloads now use your existing Realtime Database. Follow REALTIME-DATABASE-SETUP.md to enable Anonymous auth and merge the rules. Cloud Functions are no longer required.

## Verify

Submit one clearly marked test enquiry on your own website. Check EmailJS History
and your configured inbox (including spam). A successful API response means the
request was accepted, not proof of inbox delivery. No real test message was sent
while preparing this code. Network/service errors preserve the message and offer
WhatsApp or a manual email draft. There is no automatic retry after a timeout since
the service may have accepted the request already. Submitting again may send a duplicate.
