# CMS Scripts Guide

Acest fisier descrie scripturile ramase dupa cleanup si cand merita folosite.

## Regula simpla

- Foloseste mai intai scripturile din `package.json`.
- Evita scripturile SQL / DB raw daca nu ai o problema reala in productie.
- Nu rula scripturi din `dist/`; acelea sunt build output.
- Daca `dist/` exista local si vrei curatenie, il poti sterge; se regenereaza la `npm run build`.

## Scripturi uzuale

- `npm run dev`
  Porneste Strapi in development.

- `npm run start`
  Porneste Strapi prin wrapperul de productie.

- `npm run build`
  Build pentru admin panel.

- `npm run fix-apis`
  Ruleaza `scripts/generate-api-indexes.js`. Foloseste-l dupa ce creezi content types noi in Admin UI.

- `npm run export:content`
  Export de continut curent.

- `npm run export:legacy`
  Export de continut legacy.

- `npm run bootstrap:db`
  Initializare baza de date / bootstrap.

## Admin si verificare

- `npm run admin:complete-fix`
  Reset/fix mai agresiv pentru token-uri si permisiuni admin.

- `npm run admin:production-fix`
  Ruleaza `scripts/copy-admin-build.js`. Util cand build-ul admin trebuie copiat in locatia ceruta de runtime.

- `npm run admin:verify`
  Ruleaza verificarea completa a setup-ului admin.

- `scripts/reset-admin.js`
  Script de recovery pentru cont admin. Nu e in `package.json`, dar e util in caz de urgenta.

## Permisiuni publice

- `npm run grant:public`
  Varianta principala si mai sigura pentru a acorda permisiuni publice de baza.

- `npm run reset:permissions`
  Reset controlat pentru permissions plugin prin Strapi ORM.

- `scripts/fix-permissions-db.js`
  Varianta last resort, direct in Postgres. Foloseste-o doar daca fixurile prin ORM nu rezolva problema si esti sigur de schema din productie.

## Storage si upload

- `npm run fix:upload-settings`
  Fix pentru setarile de upload.

- `npm run storage:orphans`
  Detecteaza fisiere orfane din storage.

- `npm run storage:orphans:delete`
  Sterge fisierele orfane detectate.

## Debug util

- `npm run debug:routes`
  Listeaza rutele curente.

- `npm run debug:db`
  Diagnostic pentru conectarea la DB.

- `npm run debug:env`
  Afiseaza variabile runtime relevante.

- `scripts/check-production-state.js`
  Diagnostic punctual pentru content types, homepage, campanii si permisiuni publice.

- `scripts/list-api-tokens.js`
  Lista token-uri admin.

- `scripts/list-campaigns.js`
  Lista rapida de campanii pentru verificare.

## Scripturi pastrate, dar folosite rar

- `scripts/backfill-donations.js`
  Backfill pentru donatii.

- `scripts/clean-campaigns.js`
  Curatare date campanii; foloseste cu atentie.

- `scripts/cleanup-supabase-orphans.js`
  Util pentru storage Supabase; deja mapat in `package.json`.

- `scripts/debug-strapi-db.js`
  Diagnostic DB mai specializat.

- `scripts/diagnose-supabase.js`
  Diagnostic dedicat Supabase.

- `scripts/ensure-pg-env.js`
  Verificare env Postgres.

- `scripts/inspect-db-url.js`
  Inspectie pentru URL-ul DB.

- `scripts/populate-homepage-sections.js`
  Script de populare pentru homepage.

- `scripts/print-db-config.js`
  Inspectie rapida config DB.

- `scripts/seed-singles.js`
  Seed pentru single types.

- `scripts/force-publish-campaigns-direct.js`
  Script rar pentru publicare fortata a campaniilor atunci cand publicarea normala nu functioneaza.

## Ce sa NU faci

- Nu rula scripturi la intamplare doar pentru ca au nume de fix.
- Nu folosi simultan mai multe scripturi diferite pentru permissions daca nu stii exact efectul fiecaruia.
- Nu lua `dist/` ca sursa de adevar; editeaza doar `scripts/`, `src/`, `config/`.

## Flux recomandat cand apare o problema

1. Rulezi `npm run admin:verify`.
2. Daca problema e pe permisiuni publice, rulezi `npm run grant:public`.
3. Daca problema e mai grava pe permissions, rulezi `npm run reset:permissions`.
4. Daca ai probleme cu admin build in productie, rulezi `npm run admin:production-fix`.
5. Folosesti `scripts/fix-permissions-db.js` doar ca ultima varianta.
