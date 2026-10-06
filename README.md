# AI-ify My Project

> Got a project? AI-ify it.

A growth product for a 7-day, ₹2,000 campaign to get **500 final-year engineering students** into a free 60-minute AI workshop. A student types the project they already have, gets back a stronger AI-powered version as a project blueprint, reserves a workshop spot, and gets a referral link. Three friends unlock the AI Builder Pack, and every registration moves their college up the AI Builders Cup.

```
project idea → AI upgrade → see value → register → referral link → 3 friends → reward → campus leaderboard → more registrations
```

- **Design (source of truth for visuals):** [Figma file](https://www.figma.com/design/1DORgjlaJYdR3O2jvZZI5V), with the art direction written up in [DESIGN.md](DESIGN.md)
- **Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide · Node + Express · Anthropic API (optional) · JSON-file store

---

## Quick start

```bash
npm install
cp .env.example .env      # optional — everything works without editing it
npm run dev               # API on :8787, web on :5173
```

Open <http://localhost:5173/?demo=1> for the presenter demo, or <http://localhost:5173> for the normal site.

| Script | What it does |
|---|---|
| `npm run dev` | API (tsx watch) + Vite dev server, proxied together |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm start` | Production server: API + static `dist/` + SPA routes on `PORT` |
| `npm run typecheck` | `tsc --noEmit` across client, server and shared code |

Requires Node 20+.

---

## The 2-minute demo

Open `/?demo=1`. A **Demo mode** panel appears at the bottom right, and every step drives the real UI:

1. **AI-ify “Smart parking system”.** The panel types it into the hero input. It reads → finds opportunities → builds, then **AI Smart Parking Intelligence** appears with Computer Vision, Parking Prediction, Demand Forecasting and AI Assistant, scored **9.1 / 10**. Demo generations always use the deterministic pattern library.
2. **Register as a student.** The form opens prefilled with a sample student from Eastgate Institute of Technology. Click **Reserve My Spot** and you land on **YOU’RE IN.** with a referral link.
3. **A friend joins (×3).** Each click simulates a friend registering through the link. The tracker goes 0/3 → 3/3, the AI Builder Pack unlocks, and the leaderboard reads **“Your college is #3.”**

**Reset journey** clears the local state. Simulated friends are flagged `demo: true` and excluded from admin numbers by default.

**Demo credentials**

| What | Value |
|---|---|
| Admin dashboard | `/admin`, key **`aiify-admin`** (set `ADMIN_KEY` in production) |
| Demo endpoints | on when `DEMO_MODE=true` (default in dev, off with `--prod`) |

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(empty)* | Turns on live AI generation. Without it, the 26-pattern library answers. |
| `AI_MODEL` | `claude-opus-5-5` | Model for project upgrades |
| `AI_TIMEOUT_MS` | `15000` | Hard ceiling per generation before falling back to patterns |
| `PORT` | `8787` | API / production server port |
| `PUBLIC_URL` | `http://localhost:5173` | Origin used in share + referral links and OG tags |
| `DATA_DIR` | `./data` | Where `db.json` lives |
| `IP_SALT` | dev value | Salt for hashed IPs (abuse checks). **Change in production.** |
| `ADMIN_KEY` | `aiify-admin` | `/admin` access. **Change in production.** |
| `SEED_LEADERBOARD` | `true` | Seeds the AI Builders Cup with sample colleges. Set `false` before launch. |
| `DEMO_MODE` | `true` in dev | Enables `/api/demo/*`. Never enable in production. |
| `VITE_PUBLIC_URL` | *(empty)* | Client-side override for share links (build time). Falls back to `window.location.origin`. |

---

## AI configuration

`server/ai.ts` calls Claude through the official `@anthropic-ai/sdk`, using **structured outputs** (`messages.parse` + a Zod schema, `effort: "low"` for speed):

```
original idea → { isValidProject, projectName, summary, aiUpgrades[4], techStack, difficulty,
                  estimatedTime, score, whyItWorks, aiConcepts }
```

- The UI never renders model text directly. `sanitizeDraft` (in `shared/matcher.ts`) clips every field, strips markdown, clamps the score to 6.0–9.8, and rejects drafts with fewer than 3 upgrades.
- **Fallback is silent and total.** No key, a timeout, a 429, a refusal, a network error or an invalid draft all route to `shared/patterns.ts`. That's 26 hand-written upgrades (attendance, parking, library, placement, e-commerce, food delivery, hospital, agriculture, fitness, expense, learning, hostel, campus navigation, events, resume, interview, waste, traffic, tourism, community, enquiry chatbot, smart home, transport, inventory, blood bank, exams), plus an honest generic upgrade for anything else. The student never sees an API error.
- Gibberish such as `asdf` is rejected with a friendly prompt: "That doesn't look like a project yet…"
- The client adds a third layer. If `/api` is unreachable entirely, `src/services/localApi.ts` runs the same domain rules on `localStorage`. A static deploy or a dropped connection mid-demo still completes the whole journey.

---

## Data & database

`server/store.ts` is a single-process JSON store: in-memory reads with debounced atomic writes to `DATA_DIR/db.json`. That fits one instance running a 7-day / ~500-registration campaign. All business rules live in `shared/domain.ts` as pure functions over a `Data` object, so moving to a hosted database only means replacing `store.ts`.

**User:** `id, name, email, emailKey, phone, college, collegeKey, branch, year, originalProject, generatedProject, blueprintId, referralCode, referredBy, referralCount, rewardUnlocked, source, campaign, ipHash, dashToken, demo, createdAt`

**Referral:** `id, referrerId, referredUserId, referralCode, status (completed | held), reason, createdAt`

**Abuse prevention**

| Rule | How |
|---|---|
| Duplicate email | Gmail dots and `+tags` collapsed (`emailKey`) |
| Duplicate phone | Normalised to 10 digits, `+91` stripped |
| Same person returning | Email **and** phone match → their dashboard, not an error |
| Self-referral | Referrer email/phone match is rejected |
| Same-device burst | Referral from the referrer's own IP within 2 min → `held` |
| Campus Wi-Fi farming | Max 2 counted referrals per referrer per IP per day; the rest are `held` for review, not blocked |
| Throwaway inboxes | Disposable email domains rejected |
| Spam | Per-IP rate limits on AI-ify, registration and events |
| Private dashboards | `/api/me/:code` needs a `dashToken` that only the registrant holds. A public referral link exposes a first name and college, nothing else. |

IP checks are skipped for `localhost` in dev, so one laptop can test the whole loop.

<details>
<summary>Moving to Supabase (Postgres)</summary>

```sql
create table users (
  id text primary key, name text not null, email text not null, email_key text unique not null,
  phone text unique not null, college text not null, college_key text not null, branch text, year text,
  original_project text, generated_project text, blueprint_id text,
  referral_code text unique not null, referred_by text, referral_count int default 0,
  reward_unlocked boolean default false, source text, campaign text, ip_hash text,
  dash_token text not null, demo boolean default false, created_at timestamptz default now()
);
create table referrals (
  id text primary key, referrer_id text references users(id), referred_user_id text references users(id),
  referral_code text not null, status text not null, reason text, created_at timestamptz default now()
);
create table events (id bigserial primary key, name text, ts timestamptz, session_id text, source text, campaign text, college text, props jsonb);
create table blueprints (id text primary key, data jsonb not null, created_at timestamptz default now());
create index on users (college_key);
```

Then implement `store.read/write` with the Supabase client, or call the domain functions inside a transaction per request.
</details>

---

## Growth instrumentation

**Events** (`src/lib/analytics.ts`, batched, flushed via `sendBeacon` on page hide):
`page_view · project_input_started · project_generated · project_shared · registration_started · registration_completed · whatsapp_clicked · referral_link_copied · referral_link_opened · referral_registered · reward_unlocked · leaderboard_viewed · workshop_cta_clicked`. Each event carries `source`, `campaign`, `college` and a session id.

**Campaign attribution.** Append `?source=` with one of `whatsapp · poster · instagram · club · ambassador · linkedin · qr` (plus optional `&campaign=`). The source is stored first-touch, and the referral code last-touch, and both survive until registration. `/qr` builds the tracked link and QR code for each channel and prints an A5 poster.

**Referral links.** `/r/CODE` validates the code, records `referral_link_opened`, stores attribution, and continues to `/` with an invite banner ("Ravi from Riverside invited you").

**Shared projects.** `/p/:id` shows a friend's blueprint with "AI-ify yours". In production, the server rewrites `og:title` so WhatsApp previews read "I AI-ified my project: AI Smart Parking Intelligence".

**`/admin`** shows visitors, projects generated, registrations vs the 500 target, session conversion, referrals (completed / held), referral conversion, rewards, shares, a session funnel, daily visitors and registrations (separate charts), traffic sources by first touch, top colleges, top referrers, and a CSV export.

---

## Routes

| Path | |
|---|---|
| `/` | Landing + the AI-ify interaction + inline blueprint |
| `/me` | Dashboard: referral link, tracker, reward, college rank (polls every 8s) |
| `/r/:code` | Referral entry point |
| `/p/:id` | Shared blueprint |
| `/pack` | AI Builder Pack (unlocked at 3 referrals) + downloadable badge |
| `/admin` | Growth dashboard |
| `/qr` | Campaign links, QR codes, print poster |
| `/og` | Renders the 1200×630 social image (dev: saves to `public/og.png`) |
| `/privacy` | Plain-language privacy note |

---

## Deploying

**Recommended: one Node service** (Render, Railway, Fly.io, a VPS):

```bash
npm ci && npm run build
PORT=8080 PUBLIC_URL=https://your-domain ADMIN_KEY=... IP_SALT=... SEED_LEADERBOARD=false npm start
```

Mount a persistent disk at `DATA_DIR` (the JSON store needs it), and put the service behind HTTPS. `npm start` passes `--prod`, which turns off demo endpoints and dev routes.

**Static-only** (Vercel, Netlify, GitHub Pages): deploy `dist/` with an SPA fallback to `index.html`. With no `/api`, the app runs fully on the local twin: the AI-ify flow, registration, referral UI and demo all work per-browser. It's useful for a design review, but not for the real campaign, because registrations wouldn't be shared.

---

## Project structure

```
shared/            business logic shared by server + offline client
  domain.ts          register, referrals, abuse rules, leaderboard, stats
  patterns.ts        26-pattern AI fallback library
  matcher.ts         keyword matcher + model-output sanitiser
  validation.ts      zod schemas (server + offline twin)
  input.ts           zod-free helpers for the landing bundle
server/            Express API, Claude integration, JSON store, rate limits
src/
  components/
    aiify/           Aiifier (signature interaction), ProjectResult, ShareCard, ShareModal
    growth/          RegisterModal, ReferralTracker, ReferralSteps, RewardCard
    sections/        Hero, Story (before/after → final CTA), Leaderboard
    layout/          Navbar, Footer, StickyCTA, DemoBar
    ui/              Button, Field, Modal, Toast, primitives (Tag, Label, Highlighter, CropMarks…)
  pages/           Home, Dashboard, Routes (referral/shared/privacy), Admin, Tools (QR/OG/Pack)
  services/        api (remote with automatic offline fallback), localApi
  lib/             analytics, attribution, share (WhatsApp), motion tokens, storage
  styles/          tokens.css-equivalent Tailwind @theme + type scale
```

---

## Design system notes

- Tokens in `src/styles/index.css` mirror the Figma variables one to one (`color/*`, `radius/*`, motion). The type classes `t-display … t-label` mirror the Figma text styles, using the Mobile scale with the Desktop scale at ≥1024px.
- One superfamily: **Geist** (UI) + **Geist Mono** (labels, annotations, numbers).
- One accent, `#D7FF4F`, used as a highlighter: on the AI result title, the CTA key, progress, the selected state and your college. Never as gradient text.
- Signature devices: **the diff** (`− v1.0` → `+ v2.0-ai`), the **highlighter swipe**, and **crop marks + mono labels**.
- Motion: 180 / 300 / 500 / 800ms on `cubic-bezier(0.22, 1, 0.36, 1)`. `prefers-reduced-motion` drops movement and keeps fades.

**Figma file.** The Starter plan allows 3 pages and single-mode variable collections, so the 7 requested pages are sections inside 3 pages:

1. **Foundations & Components:** 99 variables (Color, Type desktop/mobile, Spacing, Radius, Motion, Breakpoints), 18 text styles, 2 effect styles, and 22 components and variant sets (Button 3×6 states, ProjectInput ×5, ReferralTracker 0–3/3, LeaderboardRow Top/Default/You…).
2. **Wireframes:** 14 grayscale screens (10 desktop, 4 mobile).
3. **Desktop · Mobile · Prototype · Handoff:** the 1440 landing page built from instances, 4 mobile screens at 390, an 8-screen click-through prototype of the growth loop (flow "Growth loop — 2 min demo"), and handoff tables (tokens → CSS, breakpoints, components → files, motion).

Where the build refined the design during QA, the code was updated and the change is noted here:
- the hero's "Try →" chips align to the first row;
- the demo panel lives bottom-right;
- mobile examples scroll horizontally.
