# Web development

Use Next.js 15 and React 19. Install dependencies with `npm ci` in this
directory, then run `npm run dev`.

## Firebase

Copy `.env.local.example` to `.env.local` and provide the Firebase project
configuration. For isolated local development, use a `demo-` project ID,
matching emulator configuration, and `NEXT_PUBLIC_USE_EMULATOR=true`.
Start Auth, Firestore, and Functions emulators from the repository root:

```sh
npm --prefix functions run build
firebase emulators:start --only auth,firestore,functions --project demo-partners
```

The default emulator addresses are `127.0.0.1:9099`, `127.0.0.1:8080`, and
`127.0.0.1:5001`. When opening a Codespaces forwarded page on another machine,
also forward these ports to that machine's localhost. Forwarding only port
3000 is not sufficient for authentication or submission.

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

## Emulator integration tests

After building Functions, run from the repository root:

```sh
firebase emulators:exec --only auth,firestore,functions --project demo-partners \
  "node --test functions/test/createInquiry.test.cjs"
```

The tests require an isolated `demo-partners` emulator project. They cover
atomic creation, permissions, delivery with credits, zero-credit holds,
validation, and retry idempotency.

Firebase CLI 15 requires Java 21 or newer. If the development container still
uses Java 17, a temporary compatible CLI can be used without changing the
repository or the globally installed CLI:

```sh
FIREBASE_CLI_EXPERIMENTS=webframeworks npx --yes firebase-tools@14.0.0 \
  emulators:exec --only auth,firestore,functions --project demo-partners \
  "node --test functions/test/createInquiry.test.cjs"
```
