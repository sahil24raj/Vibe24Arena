# Security model and deployment

## Deploy the protection together

1. Configure the browser's `NEXT_PUBLIC_FIREBASE_*` values and the server's `FIREBASE_PROJECT_ID` for the **same Firebase project**. There is no built-in production project fallback.
2. Give the server Firebase Admin credentials through Application Default Credentials or the private `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable. Never use a `NEXT_PUBLIC_` variable for credentials. The service account needs Firestore access and Firebase Authentication user lookup for revoked-token checks.
3. Set `GAME_SESSION_SECRET` to at least 32 cryptographically random characters. Replace the former hardcoded secret; old sessions are intentionally invalidated. Do not expose this value to browsers.
4. Enable Firebase anonymous authentication for guest multiplayer, alongside your existing email/Google providers. Enable email enumeration protection in Firebase Authentication. Login uses email; public username-to-email lookup has been removed.
5. Deploy this application and `firestore.rules` together. Rules deployment is separate from a Vercel application deployment (`firebase deploy --only firestore:rules --project YOUR_PROJECT`). The rules must be deployed to close direct database access. An application rollback must not restore permissive rules.
6. Review existing users, rooms, sessions and leaderboards: the previous rules allowed unauthenticated writes and email reads. Existing data cannot be assumed authentic. The new `verifiedLeaderboards` collection starts empty, populated only by server-computed multiplayer wins. Old client-written leaderboards are inaccessible. Existing rooms and sessions should be retired during rollout. Review access logs for past abuse and handle any confirmed exposure through your incident process.
7. Enable Firestore TTL on `rateLimits.expiresAt` (timestamp). Session/room expiry is enforced in code; schedule cleanup of numeric `expiresAt` fields in `gameSessions` and `rooms`. Limit retention according to your operational needs. Apply hosting/Firebase quotas and edge abuse controls: account-based limits alone do not stop attackers creating many anonymous accounts.

No production resources are changed by the repository tests. Server configuration errors fail closed with a generic 503 response.

## Trust boundaries

- Firebase ID tokens establish identity; caller-provided UIDs, host IDs and player IDs do not authorize actions.
- Profiles are private to their owner in Firestore. Public profile responses use an allowlist and respect visibility/stat/achievement preferences. Profile edits are allowlisted, and username ownership is assigned transactionally.
- All room mutations run in Firestore transactions. Membership, host privileges, turn order, state versions and lobby/game phases are checked on the server. Hidden roles and quiz answer keys are filtered before responses. Bots execute on the server.
- Sessions expire, belong to one authenticated account and finish once. Escape Door rounds enforce progression, single-use picks and totals in the database. There is no fallback cryptographic secret.
- Games simulated in browsers remain practice games. Client score ceilings are sanity checks, not proof of honest play. Local XP/coins/scores cannot overwrite cloud rewards or rankings. Competitive rankings contain server-computed match wins for the six dedicated multiplayer adapters. General duel client scores are excluded.
- API bodies have byte limits, schemas and shared per-account rate limits. Errors do not return internal exception messages. No server endpoint fetches a user-supplied URL or executes a shell command.
- Security headers prohibit framing, plugins and base URL injection. CSP allows Next.js inline hydration scripts/styles; it is a defense layer rather than a complete XSS guarantee. Avatar uploads accept bounded raster data URLs or HTTPS images.

## Local security checks

Use Node 24 and npm 11.11.0. Java 21+ is required for the official Firebase Firestore emulator.

```sh
npm ci --ignore-scripts
npm test
npm run test:security
npm run typecheck
npm run build
npm run lint
npm audit --omit=dev
npm audit
```

`test:security` starts isolated Firebase Auth/Firestore emulators for `demo-security`, uses synthetic identities and stops them afterward. Never point these tests at a real project. Ports 8080 and 9099 must be free. `.npmrc` disables dependency lifecycle scripts by default; review any future script exception individually.

## Dependency advisory triage (2026-10-11)

Next.js is upgraded to 16.4.0. Compatible transitive updates and explicit overrides fix the production advisories, including gRPC certificate validation. Overrides for basic-ftp, OpenTelemetry core and firebase-tools' uuid address additional development tooling findings.

The full audit still reports seven high entries caused by **one unresolved `braces` advisory** ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)) and its dependency chains through micromatch/fast-glob/Next ESLint and chokidar/Firebase CLI. The latest braces version available during this audit is 3.0.3, with no patched release. These packages process repository-controlled glob patterns during lint/emulator tooling and are absent from the production dependency tree. Do not feed untrusted glob patterns to development tooling. npm proposes incompatible framework/CLI downgrades, which are not applied. Recheck for a fixed upstream release by **2026-10-18**. This finding remains open for development environments.

The committed code and emulator tests do not verify production IAM, deployed Firebase rules, provider settings, hosting access controls, historic compromise, or protection against distributed anonymous-account abuse. Confirm those during rollout.
