# Lebanon Relief — Humanitarian Coordination App

A mobile-first web app connecting displaced people with volunteers and organizations who can help. Built for low-bandwidth, low-end devices, and stressful conditions.

> **Demo mode:** The deployed application currently uses synthetic data for demonstration purposes.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and add your Firebase credentials
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in methods: Email/Password and Anonymous
3. Create a **Firestore Database**
4. Copy your project config to `.env.local`
5. Deploy security rules: `firebase deploy --only firestore:rules`
6. Deploy indexes: `firebase deploy --only firestore:indexes`

### Using Firebase Emulators (recommended for development)

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Start emulators
firebase emulators:start

# Set in .env.local
NEXT_PUBLIC_USE_EMULATORS=true

# Seed sample data
npm run seed
```

### Seed Data

The seed script creates:
- **15 realistic help requests** across all categories and governorates
- **4 helper users** across different governorates with varied supply specialties
- **1 admin user**: `admin@relief.lb` / `admin123`
- **Sample claims** to test capacity tracking
- **Stats document** for the dashboard

```bash
npm run seed
```

### Default Users

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | `admin@relief.lb` | `admin123` | Access admin dashboard and moderation at `/admin/login` |
| Helper | `helper@example.com` | `helper123` | Browse requests, claim help, view contact info |

> **Note:** Change these credentials before deploying to production.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Components | Custom components (shadcn-inspired) with Radix UI primitives |
| Backend | Firebase (Firestore + Auth) |
| Forms | React Hook Form + Zod 4 |
| i18n | next-intl (English + Arabic with RTL) |
| Testing | Vitest + Testing Library |
| Anti-spam | Google reCAPTCHA v3 |
| Social sharing | Dynamic Open Graph images (edge-rendered) |

## Project Structure

```
src/
├── app/
│   └── [locale]/              # i18n routing
│       ├── page.tsx            # Landing page
│       ├── (public)/           # Request help, shelters, contacts, success
│       ├── (helper)/           # Browse, request details, registration
│       ├── (admin)/            # Dashboard, moderation, login
│       ├── privacy/            # Privacy notice
│       └── terms/              # Terms & humanitarian notice
├── components/
│   ├── ui/                     # Button, Input, Select, Card, etc.
│   └── shared/                 # RequestCard, UrgencyBadge, FilterSheet, LebanonMap, etc.
├── lib/
│   ├── firebase/               # Config, auth, requests, helpers, shelters, contacts
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Helpers, cn, matching
│   └── validators/             # Zod schemas
├── messages/                   # en.json, ar.json
└── i18n/                       # Routing, navigation, request config
```

## User Flows

### Landing Page
- Interactive SVG heatmap of Lebanon's 8 governorates with toggle between open requests and shelter counts
- Color-coded by density (green → amber → orange → red)
- Click any governorate to browse its filtered requests or shelters depending on active mode
- Quick-access buttons: Request Help, Offer Help, Emergency Contacts, Shelter Centers

### "I Need Help" (Requester)
1. Landing page → tap "I need help"
2. Fill minimal form: category, description, location, urgency, contact preference
3. Submit → get reference code
4. No login required (anonymous submission)

### "I Want to Help" (Helper)
1. Landing page → tap "I want to help"
2. Browse paginated requests with filters (category, area, urgency) and removable filter chips
3. Smart matching: personalized recommendations, priority sorting, grouped view
4. View request details (privacy-safe: no exact address, no phone shown)
5. Register → claim a request → contact via admin coordination or direct

### Shelter Centers
1. Landing page → tap "Shelter Centers" or click a governorate on the map in shelter mode
2. Step-by-step flow: pick your governorate from buttons or interactive map → see shelters
3. Shelters grouped by district with search within the selected area
4. Each shelter shows Arabic/English name, area, call button, and classroom count
5. Data sourced from ArcGIS and cached daily in Firestore (fail-safe: never deletes stale data if API fails)

### Emergency Contacts
1. Landing page → tap "Emergency Contacts"
2. Filter by governorate, call or WhatsApp directly
3. Cross-link to shelter centers page

### Admin
1. Sign in at `/admin/login`
2. Dashboard with live stats (single Firestore read)
3. Moderation: change status, flag requests, view contact info, export CSV
4. Helpers tab: verify/unverify helpers, view delivery counts

## Architecture Decisions

### Cost Optimization (Firebase)
- **Stats document**: Single `stats/global` doc for dashboard counters instead of aggregation queries. Updated via `increment()` on writes.
- **Pagination**: All list views paginate with Firestore cursors (20-50 items).
- **No real-time listeners**: All data fetched on-demand with `getDocs()` to avoid persistent connection costs.
- **Indexed queries**: Composite indexes pre-configured for common filter combinations.
- **Contact data separation**: Private subcollection `requests/{id}/private/contact` — only read when needed by authorized users.

### Anti-Fraud & Trust
- **Manual moderation queue** — new requests start as `pending_review`; admin approves before they go live.
- **Request cooldown** — duplicate requests (same user, category, governorate) blocked within 1 hour.
- **Helper verification** — admin can verify helpers; verified badge shown across the app.
- **Delivery confirmation** — both helper and requester must confirm delivery before a request is marked fulfilled.
- **Reputation scoring** — completed deliveries tracked per helper, visible to admins.
- **Audit logging** — every status change, flag, and verification action is logged.

### Privacy & Safety
- **No exact addresses collected** — only governorate, city, and general area.
- **Phone numbers in subcollection** — not readable from public request list.
- **Contact info access-controlled** — only admins and claimed helpers can read.
- **Anonymous submission** — requesters don't need accounts.
- **Client-side rate limiting** — prevents spam submissions.
- **Google reCAPTCHA v3** — invisible bot protection on all public forms.
- **Firestore security rules** — enforce read/write permissions.

### Performance
- **Mobile-first design** — 44px minimum tap targets, high contrast, minimal JS.
- **No heavy libraries** — lightweight inline SVG map, no rich text editors.
- **System fonts** — no web font downloads.
- **Static translations** — bundled in JS, no Firestore reads for i18n.
- **PWA manifest** — installable on mobile devices.

### Smart Matching (no AI)
All matching logic is pure client-side arithmetic — no external APIs or ML models.

- **Weighted scoring** — Requests scored by governorate (50pts), category (30pts), availability (20pts), city (15pts), and helper reputation (5-10pts)
- **Personalized recommendations** — Top 5 scored requests shown in "Recommended for you" section
- **Request clustering** — Groups nearby same-category requests for efficient route planning
- **Priority sorting** — `urgency_weight × time_boost × log₂(people_count)` — older unfulfilled requests with more people rank higher
- **Capacity tracking** — Warns helpers at 3 active claims but never blocks them from helping

### Authentication Strategy
- **Requesters**: Anonymous (Firebase Anonymous Auth) — zero friction.
- **Helpers**: Email/password registration — lightweight, no phone OTP cost.
- **Admins**: Email/password + `admins` collection check — secure without expensive provider.
- **Modular**: Phone auth can be added later without restructuring.

## Testing

70 tests across 4 test suites covering validators, utility functions, smart matching logic, and shelter data fetching/caching.

```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npx vitest run --coverage # Run with coverage report
```

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| matching.ts | 100% | 96% | 100% | 100% |
| request.ts (validators) | 100% | 100% | 100% | 100% |
| helpers.ts | 72% | 61% | 100% | 74% |
| **Overall** | **87%** | **81%** | **100%** | **89%** |

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run seed         # Seed Firestore with sample data
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Firebase Hosting
```bash
# Build
npm run build

# Deploy Firestore rules and indexes
firebase deploy --only firestore

# For hosting, use Firebase's Next.js integration or export static
```

## Firestore Collections

| Collection | Purpose | Access |
|-----------|---------|--------|
| `requests` | Help requests (public fields) | Public read, anyone create, admin update |
| `requests/{id}/private/contact` | Phone, name | Admin + claimed helper read only |
| `helpers` | Helper profiles | Authenticated read, self-write |
| `claims` | Helper-to-request matches | Authenticated read, helper create |
| `admins` | Admin user records | Self-read only |
| `stats/global` | Aggregated counters | Public read |
| `audit_logs` | Action audit trail | Admin read, system create |
| `shelters` | Cached shelter center data from ArcGIS | Public read, authenticated write |
| `shelters_cache/meta` | Cache TTL tracking (last fetch date) | Public read, authenticated write |

## i18n

- English (`/en/...`) — LTR
- Arabic (`/ar/...`) — RTL with full layout mirroring
- Language switcher on every page
- All UI text in `src/messages/en.json` and `src/messages/ar.json`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Firebase project configuration |
| `NEXT_PUBLIC_USE_EMULATORS` | No | Set `true` to use Firebase emulators |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | No | Google reCAPTCHA v3 site key |
| `RECAPTCHA_SECRET_KEY` | No | Google reCAPTCHA v3 secret key (server-side) |
| `NEXT_PUBLIC_BASE_URL` | No | Base URL for OG images (defaults to Vercel URL) |
| `NEXT_PUBLIC_SHELTERS_API_URL` | No | ArcGIS shelter data endpoint (has built-in default) |

## What Makes This Different

Most humanitarian tools are either heavyweight enterprise platforms or simple static directories. Lebanon Relief fills the gap:

| Feature | Typical Tools | Lebanon Relief |
|---------|--------------|----------------|
| Setup complexity | Weeks of integration | Single `npm run seed` with Firebase |
| Fraud prevention | None | Moderation queue, cooldown rules, dual delivery confirmation |
| Smart matching | Manual browse only | Weighted scoring recommends relevant requests to each helper |
| Request triage | Admin-only prioritization | Automatic priority queue: urgency × age × people count |
| Route efficiency | Helpers pick randomly | Request clustering groups nearby same-category needs |
| Helper burnout | No tracking | Capacity warnings at 3 active claims (never blocks) |
| Language support | English-only or bolted-on | Native bilingual (EN/AR) with full RTL from day one |
| Device requirements | Desktop-first | Mobile-first, works on low-end phones and slow networks |
| Bot protection | None or CAPTCHA walls | Invisible reCAPTCHA v3 — zero friction for real users |
| Privacy | Contact info exposed | Phone numbers in private subcollections, never shown publicly |
| Shelter data | Static lists, quickly outdated | Daily-cached ArcGIS data with fail-safe fallback |
| Cost | Paid platforms or heavy infra | Firebase free tier handles thousands of requests |

## Future Roadmap

- [ ] WhatsApp/SMS notifications via Cloud Functions
- [ ] Phone OTP authentication (optional, cost-aware)
- [x] Helper verification by admin
- [x] Manual moderation queue for requests
- [x] Request cooldown (duplicate prevention)
- [x] Delivery confirmation system
- [x] Basic reputation scoring
- [ ] Verified organization badges for helpers
- [ ] Offline draft saving for request form
- [ ] Admin analytics dashboard with charts
- [ ] Request search by reference code
- [ ] Soft delete with audit trail
- [ ] Image upload for requests (Firebase Storage)
- [x] Interactive SVG heatmap on landing page
- [x] Approved shelter centers with ArcGIS daily caching
- [x] Emergency contacts directory with governorate filter
- [x] Dual-mode map (requests / shelters) on landing page
- [ ] Push notifications via FCM

## License

This project is provided for humanitarian purposes. Use freely for non-commercial humanitarian coordination.
