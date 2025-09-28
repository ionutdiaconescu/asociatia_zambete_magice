# Backend Schema Notes

Status: Active (Stripe flow deferred – no secret keys required yet)
Last update: 2025-09-28

## 1. Campaigns (campanie-de-donatii)

Fields (key ones):

- title (string, required)
- slug (uid from title, unique)
- shortDescription (text) – used as summary/SEO fallback
- body (richtext)
- goal (decimal) – stored in major currency units (e.g. RON)
- raised (decimal, default 0) – also major units (update = previous + amountInMinorUnit/100)
- coverImage (media) / gallery (media multi)
- stare (enum: draft | active | completed | paused)
- isFeatured (PLANNED rename of existing idFeatured) – not yet renamed
- startDate / endDate (date)
- Relation: donatiis (oneToMany)

Planned change:

- Rename `idFeatured` → `isFeatured` (do before significant content volume). Migration path: add new boolean isFeatured, copy existing values, remove old field.

## 2. Donations (donatii)

Current relevant fields:

- campanie_de_donatii (manyToOne)
- suma (decimal, legacy display – WILL be deprecated in favor of amountInMinorUnit)
- amountInMinorUnit (integer) – SOURCE OF TRUTH for monetary value (e.g. 5000 = 50.00 RON)
- currency (enum RON/EUR/USD; default RON)
- emailDonator (email, optional for now)
- numeDonator (string)
- stare (enum: pending | completed | failed | refunded)
- metodaDePlata (enum: card | transfer bancar) – transfer not yet implemented
- mesaj (richtext)
- isAnonymous (boolean)
- stripePaymentIntentId (string) – unused until Stripe enabled
- stripeSessionId (string, unique) – added for idempotency, not used until Stripe resumes
- receiptUrl (string) – reserved
- netAmount (integer) – reserved (future reporting)
- donorCountry (string) – optional future enrichment

Conventions:

- Monetary calculations use amountInMinorUnit; `suma` kept only for backwards compatibility / manual input if needed.
- When Stripe is OFF (current phase), fields starting with stripe\* are ignored.

## 3. Pages (page)

Fields:

- title (string)
- slug (uid)
- body (richtext, required)
- seoDescription (string) – used for <meta description>
- image (media multi) / coverImage (media single)

Optional potential additions (not required now): metaTitle, openGraphImage.

## 4. Stripe Deferred Mode

Because you are not integrating Stripe yet:

- Do NOT set STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET in .env – controller lazy init prevents crashes.
- Endpoints /payments/create-checkout-session and /stripe/webhook are dormant (will 500 if called).
- Frontend should avoid calling donation endpoints that assume live Stripe until activation.

Enable later by:

1. Setting STRIPE_SECRET_KEY in cms/.env
2. Creating webhook in Stripe pointing to /api/stripe/webhook and adding STRIPE_WEBHOOK_SECRET
3. Optional: enabling pending donation creation prior to redirect

## 5. Migration Plan (Upcoming)

Phase 1 (structure hygiene):

1. Rename `idFeatured` → `isFeatured` in campaigns.
2. Mark `suma` as deprecated: stop populating automatically, rely on amountInMinorUnit.
3. (Optional) Add metaTitle to pages if SEO needs diverge from title.

Phase 2 (data consistency): 4. Script/lifecycle to backfill `raised` by summing completed donations (amountInMinorUnit/100) – single run or nightly cron (later). 5. Add unique index guard for any future external IDs (already done for stripeSessionId).

Phase 3 (activation Stripe): 6. Provide real secrets; manual test; finalize webhook logic (already implemented, just inactive). 7. Add feeAmount (integer) if Stripe fee breakdown needed. 8. Derive netAmount = amountInMinorUnit - feeAmount (if needed for reporting).

## 6. Frontend Mapping (Preview)

When enabling donations:

- API campaign.raised → UI progress current value
- API campaign.goal → UI progress max
- Donation creation form → POST /payments/create-checkout-session (after Stripe on)

## 7. Naming & Localization Notes

- Mixed naming (Romanian vs English). For consistency you can later:
  - Standardize backend internal keys to English (campaign, donation) OR keep Romanian and adapt frontend mapping.
  - For now, leave as-is (no blocking issue).

## 8. Risk & Future Safeguards

- Ensure no direct trust in client `amount` when Stripe active – rely on session.amount_total in webhook (already done).
- Consider read-only permission for donations for non-admin roles to prevent manual tampering.
- Add rate limiting in front of checkout endpoint when going public.

## 9. Quick Reference (Monetary)

- Storage: integer minor units (amountInMinorUnit)
- Display: amountInMinorUnit / 100 with locale formatting
- Aggregation (raised): sum(amountInMinorUnit where stare=completed)/100

## 10. Pending Donation Flow (Deferred)

Option (later): create a record with stare=pending before redirect so you can show “în așteptare” in admin even if user abandons checkout. Not needed now.

---

This document will evolve once Stripe activation resumes.

## 11. Runtime Config (Database & Core)

Current setup loads TypeScript-based config files (`config/*.ts`) for critical pieces:

- `database.ts` – selects Postgres when `DATABASE_CLIENT=postgres`, else falls back to SQLite (`.tmp/data.db`).
  - Required Postgres env vars: DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD
  - Optional: DATABASE_URL (overrides individual fields), DATABASE_SSL, DATABASE_SCHEMA (default `public`).
  - Pool: min/max via DATABASE_POOL_MIN / DATABASE_POOL_MAX.
- `admin.ts` – provides `auth.secret` (mapped from `ADMIN_JWT_SECRET`), API token salt, transfer token salt, encryption key.
- `server.ts` – sets host/port and `app.keys` (mandatory array from `APP_KEYS`). Must contain at least two values for session & CSRF integrity.

Removal of debug logging: All temporary console.log markers were stripped once startup stabilized. For future diagnostics you can temporarily add:

```js
if (process.env.DEBUG_CONFIG) console.log(cfg);
```

Minimal required secrets in `.env` for production:

```
APP_KEYS=key1,key2,key3,key4
ADMIN_JWT_SECRET=...
API_TOKEN_SALT=...
TRANSFER_TOKEN_SALT=...
ENCRYPTION_KEY=...
JWT_SECRET=... (used by users-permissions if applicable)
```

Fallback strategy: If Postgres is misconfigured, manually set `DATABASE_CLIENT=sqlite` to continue local development (no automatic silent fallback kept in final config to avoid accidental prod misuse).

Note: Config files prefer `.ts` variants with the active TypeScript loader; `.js` duplicates were removed to prevent drift.
