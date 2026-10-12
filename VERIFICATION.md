# Verification

Passed: local Firebase Auth/Realtime Database emulator integration tests using an
isolated demo project. Seed count 52 continued to 53; concurrent requests reached
55 without lost increments; invalid email, duplicate request, unauthenticated write,
standalone counter mutation and visitor cooldown violations were rejected. Another
visitor could not read an email. Existing cod_orders fixture data was unchanged.

Rules parsed and compiled in the database emulator. The rules merge helper preserved
unrelated nodes and refused broad root access. Existing model/catalogue tests and
JavaScript syntax checks passed. Original software ZIP bytes were preserved.

This does not prove production permissions for your existing database: merge and
review current live rules and enable Anonymous Authentication first. No production
writes, email sends or hosting deploys were performed. Browser QA remains pending.

The local test used Firebase CLI 14 with the installed Java 17. Latest CLI requires
Java 21 or newer for emulator testing. This is separate from Hosting deployment.
