# QA Checklist

Acest document oferă un set de verificări rapide înainte de deploy.

## 1. Accesibilitate (A11y)

- [ ] Fiecare pagină are un `<h1>` unic și descriptiv.
- [ ] Landmark-uri: `main` (prin Layout), skip link funcțional (tab -> Enter).
- [ ] Elemente interactive focusabile cu contur vizibil (`:focus-visible`).
- [ ] Imaginile decorative au `alt=""`; imaginile semantice primesc alt descriptiv.
- [ ] Progres bar-urile au atribute ARIA corecte (role, aria-valuenow/… și srLabel ascuns).
- [ ] Anunțuri dinamice folosesc aria-live region (`#app-live-region`).
- [ ] Contrast text pe background deschis și dark mode ≥ AA (verificare rapida cu plugin).
- [ ] Navigare numai tastatură posibilă fără capcane.

## 2. Performanță / Încărcare

- [ ] Pagini secundare sunt lazy loaded (verificat bundle split în network devtools).
- [ ] Imaginile au `loading="lazy"` unde e posibil și dimensiuni rezonabile.
- [ ] Nu există console.error nerelevante în runtime.
- [ ] Rețea offline: campaniile și paginile afișează fallback (mock) / mesaje clare.

## 3. SEO Tehnic

- [ ] Titlu dinamic setat (Meta) – include brandul o singură dată.
- [ ] Meta description există și e sub ~155 caractere (Home, CampaignDetail, About, Contact).
- [ ] Canonical prezent acolo unde este necesar (campanii detaliu).
- [ ] Open Graph tags: og:title, og:description, og:image (când există imagine), og:type.
- [ ] JSON-LD Organization + WebSite pe Home.
- [ ] JSON-LD CreativeWork pe pagina campaniei (detaliu).
- [ ] Fără duplicate page titles evidente.

## 4. Date / CMS

- [ ] Campaniile se încarcă din Strapi; slug-urile funcționează.
- [ ] Slug invalid => fallback / mesaj eroare clar + buton Reîncearcă.
- [ ] Paginile About / Contact vin din CMS (sau fallback text clar dacă Strapi indisponibil).
- [ ] Schimbarea rapidă de rețea (offline->online) + reload funcționează.

## 5. UI Consistență

- [ ] Componente repetate (CampaignCard, skeleton) păstrează spacing și stil consistent.
- [ ] Butoane folosesc variante definite (primary/outline/etc.).
- [ ] Layout responsiv (mobile: grid 1 col, >md: 2, >lg: 3 pentru campanii).
- [ ] Dark mode nu rupe contrastul (text, card backgrounds, border subtle).

## 6. Erori & Fallback

- [ ] ContentState afișează skeleton -> eroare -> conținut corect.
- [ ] Reload după eroare reexecută efectiv fetch (tick increment / hook state reset).
- [ ] Live region nu rămâne blocat pe un mesaj de eroare după recuperare.

## 7. Cod & Arhitectură

- [ ] Serviciile (`services/*`) nu importă React.
- [ ] Hook-urile folosesc cleanup corespunzător (flag `active` în efecte async).
- [ ] Tipurile (types) actualizate: CampaignSummary/Detail includ slug, updatedAt.
- [ ] Nu există importuri nefolosite (rulare linter).

## 8. Security / Privacy (de bază)

- [ ] Nicio cheie secretă în cod client (verificat `.env` public vs privat).
- [ ] URL de API vine din `VITE_API_BASE_URL` (sau fallback previzibil dev).

## 9. Pregătire Deploy

- [ ] Build local reușit fără erori.
- [ ] Verificat 404 route (`/*`) afișează NotFound.
- [ ] Link-urile interne folosesc `<Link>` pentru navigare fără reload.
- [ ] Nicio dependență inutilă / nefolosită adăugată recent.

## 10. Idei viitoare (Nu blochează lansarea)

- [ ] Teste unitare pentru mapStrapiCampaign & fetch fallback.
- [ ] PWA manifest + icons.
- [ ] Filtre / căutare campanii.
- [ ] Suport multi-limbă (i18n).
- [ ] Cache local (stale-while-revalidate) pentru liste.

---

Bifează fiecare punct înainte de a livra. Dacă unele nu se aplică, notează motivul lângă casetă.
