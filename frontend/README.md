## Frontend – Zâmbete Magice

Stack: React 19 + TypeScript + Vite + React Router v7 + Tailwind CSS 3.4.x.

### Folder Structure (simplified)

```
src/
  main.tsx        # Bootstrap (BrowserRouter + App)
  App.tsx         # Declares top-level <Routes/>
  components/
    Navbar.tsx
    Layout.tsx    # Navbar + <Outlet/> + Footer wrapper
    ui/
      Button.tsx
      Card.tsx
      Section.tsx
  pages/
    Home.tsx
    Campaigns.tsx
    CampaignDetail.tsx
    About.tsx
    Contact.tsx
    DonateSuccess.tsx
    DonateCancel.tsx
  assets/         # Static assets (images, svgs, etc.)
  index.css       # Tailwind entry (@tailwind directives)
```

### Routing

Routes are nested under a single `Layout` component so Navbar / Footer are centralized:

```
<Route element={<Layout/>}>
  <Route index element={<Home/>} />
  <Route path="campaigns" element={<Campaigns/>} />
  <Route path="campaigns/:id" element={<CampaignDetail/>} />
  <Route path="about" element={<About/>} />
  <Route path="contact" element={<Contact/>} />
  <Route path="donate" element={<Donate/>} />
  <Route path="donate/success" element={<DonateSuccess/>} />
  <Route path="donate/cancel" element={<DonateCancel/>} />
  <Route path="*" element={<NotFound/>}/> (inline for now)
</Route>
```

Add a new page:

1. Create the file in `src/pages/YourPage.tsx`.
2. Import it in `App.tsx` and add a `<Route path="your-path" element={<YourPage/>} />` inside the layout route.

### Styling & Tailwind

Tailwind is configured in `tailwind.config.js` with custom brand palette and container centering. Base directives live in `src/index.css`:

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Custom brand colors: `brand: { 50..900 }` plus default shadows extended. Use `className="text-brand-600"` etc.

### Navbar

- Uses `NavLink` to auto-apply active styles.
- Mobile menu uses a controlled `open` state + `max-height` CSS transition.
- CTA button path `/donate` (placeholder until donation flow built).

### Layout

`Layout.tsx` centralizes structural chrome (navbar, main spacing, footer). All pages render through `<Outlet/>`.

### Environment & Commands

Install dependencies (already done usually):

```
npm install
```

Run dev server:

```
npm run dev
```

Build production:

```
npm run build
```

Preview production build:

```
npm run preview
```

### Conventions

- Components: PascalCase in `components/`.
- Pages: One default export per file, minimal logic; data fetching (future) via hooks/services.
- Avoid inline complex logic in JSX; extract helpers.
- Use semantic HTML (`<section>`, `<header>`, `<nav>`, etc.) for accessibility.

### UI Primitives

- `Button` variants: `primary | secondary | outline | ghost` (+ `loading` prop spinner)
- `Card` + `CardHeader` + `CardTitle` + `CardContent`
- `Section` wrapper with spacing (`sm|md|lg`), optional title / description, container handling

Example:

```
<Section title="Campanii" description="Proiecte active">
  <div className="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader><CardTitle>Exemplu</CardTitle></CardHeader>
      <CardContent>Text...</CardContent>
    </Card>
  </div>
</Section>
```

### Donate Flow (Current State)

`/donate` pagina include:

- Selectare campanie activă
- Sume preset: 25 / 50 / 100 / 250 RON
- Input sumă personalizată (numeric only)
- Câmp email pentru confirmarea Stripe
- Rezumat donație + redirect către Stripe Checkout

Flow-ul actual:

1. Frontend citește `GET /api/payments/status` din CMS.
2. Dacă plățile nu sunt configurate, butonul este dezactivat și utilizatorul vede mesajul relevant.
3. La submit, frontend trimite `POST /api/payments/create-checkout-session` cu `{ amount, campaignId, donorEmail }`.
4. CMS răspunde cu `url` de Stripe Checkout.
5. Browserul redirecționează către Stripe.
6. Success/Cancel revin în `/donate/success` și `/donate/cancel`.

Observație:

- Codul este pregătit pentru Stripe, dar poate rămâne în mod sigur „disabled” până când există cheile reale și `FRONTEND_URL` corect în CMS.

### Deploy Notes

- Domeniu frontend: `https://zambetemagice.com`
- Domeniu CMS/API: `https://asociatia-zambete-magice.onrender.com`
- Pentru refresh/direct hit pe rutele React (`/donate`, `/campaigns/...`) există fallback-uri SPA în `vercel.json` și `public/_redirects`.
- Dacă `/donate` sau alte rute returnează 404 în producție, primul lucru de verificat este că hostul frontend folosește rewrite-ul către `index.html`.

### Services Layer

`src/services/campaigns.ts` oferă funcții mock:

- `fetchCampaigns()` – listă campanii (mock + delay)
- `fetchCampaignDetail(id)` – detaliu campanie

Înlocuire viitoare: substituie mock cu request real (fetch/axios) spre CMS API.

### Planned Next Steps

1. Add reusable UI primitives (Button, Card, Section wrapper).
2. Integrate CMS API for campaigns list & detail (replace mocks).
3. Wire Stripe Checkout creation endpoint + redirect.
4. Global loading & error boundaries.
5. SEO meta tags & OpenGraph (per route) – possibly via `react-helmet-async`.
6. Add skeleton loaders (loading states).
7. Accessibility enhancements (skip link, focus outlines).
8. Extract shared formatting utils (currency, dates).

### Manual QA Checklist (Current Milestone)

- Navbar fixed at top, becomes opaque enough to read content.
- All nav links navigate without full page reload.
- Mobile menu opens/closes smoothly, closes after clicking a link.
- 404 message appears for unknown route (test `/xyz`).
- Tailwind utilities applied (inspect an element – classes expand in dev tools).
- Donate page (`/donate`):
  - Clicking preset amount highlights selection.
  - Custom amount input accepts only digits and updates total.
  - Button disabled when no amount selected; enabled when valid amount.
  - Loading spinner appears briefly after clicking donate (simulated).
  - Responsive layout collapses columns on mobile.
- NotFound route shows 404 component.
- UI primitives:
  - Button variants render distinct styles.
  - Card hover shadow appears (desktop) when hover prop active.
  - Section spacing changes with spacing prop.

### Troubleshooting

| Symptom                      | Possible Cause                             | Fix                                                                                       |
| ---------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Classes not applied          | Forgot `@tailwind` directives              | Check `src/index.css` for the three directives.                                           |
| New component styles missing | File path not in `content` globs           | Ensure `tailwind.config.js` includes `./src/**/*.{js,ts,jsx,tsx}`. Restart dev if needed. |
| 404 for API calls            | CMS dev server not running / proxy missing | Start CMS or configure Vite proxy in `vite.config.ts`.                                    |
| Mobile menu doesn’t animate  | Removed transition classes                 | Restore `transition-[max-height] duration-300`.                                           |

### Quick Verification Script (Manual)

1. `npm run dev` – ensure server starts without errors.
2. Open `/` – see home placeholder.
3. Navigate to each route via navbar – URL and content update.
4. Resize below 768px – hamburger appears; open & close works.
5. Enter an unknown path (e.g. `/abc`) – 404 message displays.
6. Run `npm run build` – build completes successfully.
7. `npm run preview` – confirm built site serves same routes.

### Adding Data Fetching (Preview Pattern)

Create a service file, e.g. `src/services/campaigns.ts`:

```
export async function fetchCampaigns() {
  const res = await fetch('/api/campaigns');
  if (!res.ok) throw new Error('Failed to load campaigns');
  return res.json();
}
```

Then in a page component use `useEffect` or a data fetching hook library (e.g. TanStack Query) later.

### License

Internal project – adapt as needed.

---

Original Vite template documentation has been replaced with project-specific notes above. Refer to Vite docs for advanced configuration.
