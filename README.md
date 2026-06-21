# Card Perks — Credit Card Benefits Tracker

A premium, Apple-like, **shareable** checklist of every annual/recurring credit-card
benefit you can still claim — built so two people (you and a partner) can both tick things
off and never forget a credit again.

The whole app is a **single self-contained React artifact**:
[`src/CreditCardBenefitsTracker.jsx`](src/CreditCardBenefitsTracker.jsx). It runs as-is when
pasted into the Claude artifact environment, and the small Vite scaffold here lets you
preview it locally.

## Features

- **Unlimited cards, added dynamically.** Each physical card is tracked separately (3 of
  the same card = 3 independent checklists). Add from a built-in template, set a quantity to
  create several at once, or build a fully custom card. Cards are editable and deletable.
- **Benefits with real reset cadences.** Each benefit has a name, annual value, a note and a
  cadence — monthly, quarterly, semi-annual, annual, or "perk" (info-only, no checkbox). The
  checklist renders the right number of boxes per cadence (a $20/mo credit → 12 monthly
  boxes; a semi-annual credit → 2 boxes) and highlights the period that's live right now,
  with a "used X/N" counter.
- **Two views (segmented control).**
  - **To-Do** (default): one clean, iOS-Reminders-style list of everything claimable *right
    now*, pulled across every card. Tap a circle to check it; checked items move to a
    "Done this period" group showing who checked it and when.
  - **All Cards**: each card expands to its full punch-card grid of benefits × periods.
- **Reset dates.** Per card, choose *Calendar year (Jan 1)* or *Card anniversary* (with a
  date). Annual benefits anchor their cycle to that date and show "renews [date]"; anniversary
  cards with no date show a gentle "set reset date" nudge. Monthly/quarterly/semi-annual stay
  on the calendar — accurate to how cards actually work.
- **ROI stats.** A dark "metal card" hero panel shows **Available to claim now** (big number),
  benefits captured this year, total annual potential, total annual fees, and net (captured −
  fees), with a progress bar. Totals are grouped by currency.
- **AI benefit research.** When adding a custom card, *Research with AI* calls the Anthropic
  API (`claude-sonnet-4-6`, `max_tokens: 1000`, no API key needed in-artifact) and asks for a
  JSON array of recurring credits, then populates an editable benefit list flagged **verify**.
- **Sharing via "spaces."** On first open you create a new space (a short random code) or join
  one with a code. All data is namespaced to that code, so each space is isolated. Partners
  join the same code to sync; anyone else who opens the link gets a fresh private copy of the
  card templates. A Share panel shows the code with copy + instructions and a switch-space
  option.

## Technical notes

- **Persistence uses `window.storage`** (the artifact key-value API), not `localStorage`.
  Space data (cards, check-offs) uses `shared: true` keyed by the space code; the active space
  code and the user's name use personal `shared: false` storage. When `window.storage` isn't
  present (local dev) it transparently falls back to `localStorage` / in-memory.
- **First render never blocks on storage.** The app renders instantly and hydrates in the
  background; every storage read is wrapped in `try/catch` **and** raced against a ~1.5s
  timeout, so a slow or missing storage bridge can't hang the app.
- **Only core Tailwind utility classes** are used (the artifact env has no Tailwind compiler).
  Exact values — overlay opacity, gradients, custom heights, accent fills — use inline
  `style`.
- Mobile-friendly: large tap targets, responsive layout, bottom-sheet modals on small screens.
- Icons from `lucide-react`. The component is the default export.

> Pre-loaded cards (Mandiri Prioritas, Mandiri Marriott Bonvoy, OCBC VOYAGE, BCA KrisFlyer,
> UOB PRVI Miles) ship with researched benefits. **Verify amounts before relying on them —
> card terms change.**

## Use it as an artifact

Copy the contents of `src/CreditCardBenefitsTracker.jsx` into a Claude React artifact. It
imports `react` and `lucide-react`, default-exports the component, and uses the artifact's
`window.storage` and Anthropic API — no extra setup.

## Run locally (preview)

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
```

Local preview loads Tailwind via the Play CDN (see `index.html`) so the same core utility
classes render without a build step. The AI research button needs the artifact runtime, so it
will show a friendly error locally — add benefits manually there.
