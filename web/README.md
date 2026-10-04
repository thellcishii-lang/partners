# Web development

Use Next.js and React 19. Install dependencies with `npm ci` in this
directory, then run `npm run dev`.

## Firebase

Copy `.env.local.example` to `.env.local` and provide the Firebase project
configuration. For isolated local development, use a `demo-` project ID and
`NEXT_PUBLIC_USE_EMULATOR=true`. In Codespaces, start the emulators from the
repository root:

```sh
npm --prefix functions run build
node scripts/start-emulators.mjs
```

Firebase CLI 15 requires Java 21 or newer. The development container installs
Java 21; rebuild an existing container to apply the updated Java version.
Keep the emulator command running, then open port 4000 from the Codespaces
Ports tab to access the Emulator UI. Forwarding the port alone does not start
the UI.

Alternatively, run the VS Code task **Firebase: start emulators**. It builds
Functions and starts the emulators with the same configuration.

The launcher serves the browser-facing Emulator UI on port 4000 and the
original Firebase UI internally on port 4001. It injects a transport adapter
that sends Firestore, Auth, Storage, and request-monitor WebSocket traffic
through port 4000. This avoids browser requests to the browser machine's
`127.0.0.1` and cross-port authentication/mixed-content failures in Codespaces.
Open port 4000, not the internal UI on 4001. Starting Firebase directly without
the launcher does not start the proxy.

The launcher uses `NEXT_PUBLIC_FIREBASE_PROJECT_ID` from `web/.env.local` as
the emulator project ID (it must start with `demo-`). The web app and the
emulators must use the same project ID: otherwise Firestore writes from the app
go to a different project than Auth, the Emulator UI, and Functions triggers.
Restart `next dev` after changing `.env.local`.

Emulator data is restored from and saved to `.firebase/emulator-data`
(gitignored). Stop the launcher with a single Ctrl+C so the export can finish;
a second Ctrl+C skips the export.

`onDepositOrderPaid` runs on updates only. To test it manually, create a
`depositOrders` document with `status: "pending"` (and `advertiserId`,
`credits` as a number, `priceJpy`, `paidAt: null`), then change `status` to
`"paid"`.

### Port 4000 returns HTTP 401 in Codespaces

Port 4000 serves the Firebase Emulator UI, not the Next.js web app (port 3000).
Keep this port private because the emulator UI exposes local development data.
An HTTP 401 response with `www-authenticate: tunnel` comes from the Codespaces
forwarding service, before the request reaches Firebase. Changing Firebase
Auth settings or Firestore rules will not fix it.

Sign in to GitHub in the browser with the account that owns the Codespace,
then use **Open in Browser** for port 4000 in the Codespaces **Ports** tab.
If authentication still fails, sign in to the Codespace again and reopen the
port from that tab rather than using an old forwarded URL. Do not make the
emulator ports public to bypass authentication.

Also ensure the emulators are running. From the Codespace terminal,
`curl -I http://127.0.0.1:4000/` should return HTTP 200. A connection failure
means the Emulator UI is stopped; run **Firebase: start emulators** and leave
the task running. A local HTTP 200 combined with a forwarded HTTP 401 indicates
a Codespaces/browser authentication issue, not an Emulator UI failure.

Open the web app with `npm run dev` from `web/`. The browser connects to the
emulators through same-origin Next.js rewrites, so keep emulator ports private;
only the web app needs to be forwarded to the browser. The local emulator
addresses are `127.0.0.1:9099`, `127.0.0.1:8080`, `127.0.0.1:5001`, and
`127.0.0.1:9199`.

Firebase Auth's emulator URL must be an origin, without a path prefix: the SDK
discards that prefix. Next.js forwards `/identitytoolkit.googleapis.com/`,
`/securetoken.googleapis.com/`, and `/emulator/auth/` to the Auth emulator for
sign-in, token refresh, and Google sign-in respectively. Restart the web server
and fully reload the browser after changing emulator configuration.

Run the proxy configuration regression tests from this directory:

```sh
node --test test/authEmulator.test.cjs
```

Run the Emulator UI proxy regression tests from the repository root:

```sh
node --test scripts/emulator-ui-proxy.test.mjs
```

## Listings and applications

- `/listings`: published listings, readable without login.
- `/listings/new`: draft or review submission by a registered advertiser.
- `/listings/[id]`: public details, or private preview by the owner.
- `/listings/[id]/edit`: owner editing; saving returns the listing to draft
  or review. Publishing requires an administrator.
- `/listings/[id]/apply`: authenticated application.
- `/listings/[id]/apply/complete`: live submission/delivery status.
- `/dashboard`: the advertiser's listings and edit links.

Advertiser eligibility is checked against the current user's `advertisers`
document (and excludes profiles explicitly marked as applicants). User roles
are server-managed; signup does not write a role from the browser.
Company names are copied onto listing documents because advertiser profiles
are not publicly readable.

Deploy `createInquiry` and the existing `onInquiryCreated` trigger before
using submissions against a real project. The callable verifies authentication,
published listing status, recipient existence, and form data. It atomically
creates `inquiries` and `inquiryDetails` with the same ID and increments the
recipient's pending count. Repeat requests with the same submission ID do not
create another inquiry or consume another credit. The existing trigger consumes
the deposit and changes the inquiry to `delivered` when credits are available.
With zero credits, it remains `pending`. No Firestore rules are relaxed:
personal details remain writable only through the Admin SDK.

The callable copies the applicant's existing `applicants` document into the
private snapshot. If the user has no applicant profile yet, the snapshot
contains the submitted name and authenticated email. The public mask fields
are entered separately; never enter identifying information in them.

## Deposit purchase (Stripe Checkout)

Advertisers buy deposits at `/deposit`. One credit is consumed per delivered
application and costs 2,500 JPY. The amount is 10,000 JPY (4 credits),
30,000 JPY (12 credits), or a custom amount above 30,000 JPY in 2,500 JPY
steps (up to 2,500,000 JPY). The same values live in
`functions/src/depositPricing.ts` and `web/src/lib/depositPricing.ts`; the
server validates every amount.

1. The `createDepositCheckout` callable creates a `pending` `depositOrders`
   document and a Stripe Checkout session, then the page redirects to Stripe.
2. Stripe sends `checkout.session.completed` to the `stripeWebhook` HTTP
   function. After verifying the signature, the amount, and the currency, it
   changes the order to `paid` (once per order).
3. `onDepositOrderPaid` adds the credits and releases held applications,
   oldest first. `/deposit/complete` shows the result.

Without Stripe keys in the emulators, `createDepositCheckout` simulates a
successful payment: the order becomes `paid` immediately and no Stripe page is
shown. This only happens in the emulators; in production, a missing key is an
error.

To use Stripe test mode in the emulators, create `functions/.secret.local`
(gitignored, never commit it) and restart the emulators:

```sh
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Forward test webhooks with the Stripe CLI and use the `whsec_...` it prints:

```sh
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired \
  --forward-to http://127.0.0.1:5001/demo-partners/asia-northeast1/stripeWebhook
```

Pay with the test card `4242 4242 4242 4242`, any future expiry date and any
CVC.

For production, set the secrets with
`firebase functions:secrets:set STRIPE_SECRET_KEY` and
`firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`. List the site origins
allowed as Checkout return URLs in `functions/.env`, for example
`APP_ORIGINS=https://example.com`. Register the deployed `stripeWebhook` URL as
a Stripe webhook endpoint with the same four events.

## Emulator integration tests

After building Functions, run from the repository root:

```sh
FIREBASE_CLI_EXPERIMENTS=webframeworks npx --yes firebase-tools@14.0.0 \
  emulators:exec --only auth,firestore,functions --project demo-partners \
  "node --test functions/test/createInquiry.test.cjs functions/test/deposit.test.cjs"
```

The tests require an isolated `demo-partners` emulator project. They cover
atomic creation, permissions, delivery with credits, zero-credit holds,
validation, and retry idempotency. The deposit tests cover amount
validation, return-origin checks, simulated purchases that release held
applications, and signed Stripe webhooks (invalid signatures, amount
mismatches, duplicate deliveries, and expired sessions).

Firebase CLI 15 requires Java 21 or newer. If the development container still
uses Java 17, a temporary compatible CLI can be used without changing the
repository or the globally installed CLI:

```sh
FIREBASE_CLI_EXPERIMENTS=webframeworks npx --yes firebase-tools@14.0.0 \
  emulators:exec --only auth,firestore,functions --project demo-partners \
  "node --test functions/test/createInquiry.test.cjs"
```
