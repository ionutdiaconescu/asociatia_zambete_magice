# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>

---

## 📦 Database Strategy (SQLite now → Postgres later)

Current mode: **SQLite** (single editor, low write concurrency, minimal cost).

Why SQLite now:

- Zero external service to manage
- Fast enough for early traffic
- Simple backups (copy the `.tmp/data.db` file while Strapi stopped)

Plan to migrate when ANY of:

1. > 10,000 cumulative donations OR > 200 donations / day
2. Need advanced reporting / multiple admin editors
3. Want automated managed backups

Migration outline:

1. Provision Postgres (e.g. Supabase)
2. Set Postgres vars in `.env` (see `.env.example`), switch `DATABASE_CLIENT=postgres`
3. Run `npm run dev` once (schema auto-created)
4. Export from SQLite & recreate in Postgres (custom script; replay create operations)
5. Run maintenance scripts:
   - `npm run sync:donations`
   - `npm run recompute:raised`
6. Smoke test: /api/campanie-de-donatiis, /api/stats, a campaign slug page

## 💳 Stripe & Money Conventions (to be expanded)

Core principles:

- All authoritative amounts stored in `amountInMinorUnit` (integer; RON bani)
- `suma` is a denormalized decimal for admin readability (synced via script)
- Campaign `raised` is recalculable: SUM(completed donations) / 100

Maintenance scripts:

- Sync donation decimals: `npm run sync:donations -- --dry` then without `--dry`
- Recompute campaign raised: `npm run recompute:raised -- --dry` then without

Stripe flow (current CMS-based flow):

1. Frontend calls CMS payments API to create Checkout Session (amount user-entered)
2. User pays on Stripe hosted page
3. Webhook (payment succeeded) → create donation (store minor units, set `stare=completed`)
4. (Optional batch) Recompute campaign raised

Current endpoints:

- `GET /api/payments/status`
- `POST /api/payments/create-checkout-session`
- `POST /api/stripe/webhook`

Current activation model:

- Dacă `STRIPE_SECRET_KEY` sau `FRONTEND_URL` lipsesc, `payments/status` returnează `ready: false`.
- În starea aceasta frontend-ul dezactivează checkout-ul în loc să lase utilizatorul să intre într-un flow stricat.
- `create-checkout-session` răspunde cu `503` și `PAYMENTS_NOT_CONFIGURED` când Stripe nu este gata.

## 🌐 Production Domains

- Frontend: `https://zambetemagice.com`
- CMS: `https://asociatia-zambete-magice.onrender.com`

## ✅ Stripe Activation Checklist

De făcut când contul Stripe al asociației este pregătit:

1. Setezi în CMS env:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL=https://zambetemagice.com`
   - opțional `DONATION_CURRENCY=RON`
2. Configurezi webhook Stripe către `https://asociatia-zambete-magice.onrender.com/api/stripe/webhook`.
3. Faci redeploy la CMS.
4. Verifici `GET /api/payments/status` și confirmi `ready: true`.
5. Testezi un checkout complet cu card de test înainte de live.

Observație:

- Build-urile locale frontend și CMS au trecut după ultimele schimbări; dacă live există probleme după push, focusul trebuie să fie pe env/redeploy/runtime, nu pe compilare.

## 🧭 Campaign History Criteria

O campanie este considerată ISTORICĂ dacă îndeplinește ORICARE dintre condițiile:

1. `stare === completed` (închisă explicit în panoul de administrare)
2. Are `endDate` în trecut (data de sfârșit a expirat)
3. A atins sau depășit goal-ul (raised >= goal) și nu mai este în stare `active`

În toate celelalte cazuri (inclusiv: fără endDate setat, în desfășurare, sub goal) este considerată ACTIVĂ.

Edge cases / clarificări:

- Campanie fără `endDate`: rămâne activă până este marcată completed sau atinge goal și este închisă manual.
- Campanie cu `endDate` trecut dar încă în stare `active`: front-ul o mută la istoric chiar dacă adminul a uitat să modifice `stare`.
- Dacă raised ≥ goal dar `stare` rămâne `active`, o puteți închide manual (altfel apare încă activă pentru transparență până la intervenție).
- Campanie reactivată (schimbi `stare` din completed în active): va apărea din nou la active, indiferent de date istorice.

Motivație: vizitatorul trebuie să vadă separat ce poate susține ACUM și ce am finalizat deja (transparență + impact istoric).

Algoritmul frontend (conceptual):

```
isHistorical = (stare === 'completed') || (endDate && endDate < azi) || ((raised >= goal) && stare !== 'active')
isActiveNow = !isHistorical
```

## 🔐 Roles (summary)

Public: read campaigns, homepage, stats, create checkout session
Editor: CRUD campanii, update homepage, read donații
Admin: full access

## 🛠 Useful Commands

```
npm run develop         # Dev mode
npm run build           # Admin build
npm run sync:donations  # Sync 'suma' with amountInMinorUnit
npm run recompute:raised# Recalculate campaign raised field
```

## 🗂 Backups (SQLite)

Stop Strapi → copy `.tmp/data.db` somewhere safe → start Strapi.

## 🚀 Future Enhancements (ideas)

- Switch media storage to S3 compatible bucket
- Add donation analytics endpoint (group by month)
- Automate recompute via cron if needed

## 💶 Donații prin Transfer Bancar (Homepage Donation Fields)

Fără procesator online pentru faza inițială – folosim instrucțiuni IBAN configurabile în single type `homepage`.

### Câmpuri relevante în `homepage`:

- `donationIban` – IBAN oficial (fără spații). Exemplu: `RO49BTRL....`
- `donationBankName` – Numele băncii (ex: "Banca Transilvania")
- `donationBeneficiaryName` – Numele complet al asociației, EXACT cum apare în bancă
- `donationInstructions` (rich blocks) – Text formatat: pași donație, mențiuni fiscale, sponsorizare vs donație, email de contact
- `donationReferenceHint` – Scurt șir sugerat ex: `DONATIE GENERALA` sau `DONATIE EDU` (≤ 35 caractere)
- `seoTitle`, `seoDescription`, `seoSocialImage` – SEO per homepage

### Recomandări imagine Hero (`heroBackgroundMedia`)

- Raport recomandat: `16:9`
- Dimensiune ideală: `2400x1350` px
- Dimensiune minimă: `1920x1080` px
- Format recomandat: `JPG` sau `WEBP`
- Greutate fișier recomandată: sub `2 MB` pentru încărcare rapidă
- Evită text important în margini: păstrează subiectul principal în zona centrală (safe area)

Checklist după schimbarea imaginii Hero:

1. În `Content Manager -> Homepage`, atașezi fișierul în `heroBackgroundMedia`.
2. Apeși `Save` și apoi `Publish` (obligatoriu la single type cu draft/publish).
3. Verifici endpointul public: `GET /api/homepage?populate=*` și confirmi că `heroBackgroundMedia` nu este `null`.
4. Verifici vizual homepage pe desktop și mobil.

### Afișare în frontend

- Secțiune dedicată "Donează prin transfer bancar"
- Buton "Copiază IBAN" (clipboard API)
- Instrucțiuni și referință sugerată (dacă există)

### Recomandări de conținut

1. Explică unde merg fondurile (general vs campanii specifice)
2. Menționează dacă trimiteți chitanță / certificat de sponsorizare la cerere (email contact)
3. Adaugă disclaimere legale minime (ex: asociația este înregistrată… / cod fiscal dacă va fi necesar)
4. Clarifică: dacă dorește direcționarea către o campanie anume să adauge numele campaniei în descrierea transferului

### Checklist când se modifică IBAN

- Actualizezi `donationIban`
- Verifici display pe homepage (desktop + mobil)
- (Opțional) Actualizezi materialele tipărite / social templates

### Viitor (posibile îmbunătățiri)

- Adăugare câmp `donationQrImage` (manual) sau generare dinamică payload EPC
- Diferite IBAN-uri pe campanie (ar însemna nou câmp pe modelul campaniei – de discutat doar dacă apare nevoia)
- Endpoint `/api/donations/intake` pentru ca donatorul să lase email + sumă estimată (follow-up manual)

### De ce păstrăm referința sugerată

Ajută la reconcilierea manuală: dacă extrasul are text standardizat, căutarea devine mai simplă.

## 🧾 Reconciliere & Scripturi (rezumat donații offline)

Nu există webhook – update-ul `raised` se face periodic cu scriptul `recompute:raised` după introducerea donațiilor în `donatii` (dacă decideți să le încărcați). În faza strict "transfer bancar" se poate opera fără înregistrarea fiecărei donații până la migrarea la un procesator.
