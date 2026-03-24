# Lebanon Relief + Shabaka — Crisis Coordination Platform

A mobile-first web app with two integrated modules:

1. **Lebanon Relief** — Connecting displaced people with volunteers who can help
2. **Shabaka (شبكة)** — Organizational crisis coordination platform for NGOs, municipalities, and ground initiatives

> **Data mode:** Both the individual help flows and the Shabaka coordination platform now read from Firebase. The synthetic platform dataset remains in-repo as a seed source and fixture set.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and add your Firebase credentials
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. Open http://localhost:4001
```

## Platform Overview

### Module 1: Individual Help Requests (Lebanon Relief)

| Page | URL | Description |
|------|-----|-------------|
| Landing Page | `/en` | Interactive heatmap, action buttons |
| Request Help | `/en/request-help` | Anonymous help request form |
| Browse Requests | `/en/browse` | Helpers browse & claim requests |
| Shelter Centers | `/en/shelters` | ArcGIS-sourced shelter directory |
| Emergency Contacts | `/en/contacts` | Direct call/WhatsApp directory |
| Privacy Notice | `/en/privacy` | Fully translated (EN/AR) privacy policy |
| Terms of Use | `/en/terms` | Fully translated (EN/AR) terms & humanitarian notice |
| Admin Dashboard | `/en/admin/dashboard` | Stats & request management |
| Admin Moderation | `/en/admin/moderation` | Review queue, CSV export |

### Module 2: Shabaka Crisis Coordination Platform (23 Features)

All 23 features from the platform spec, organized into 4 layers:

#### Foundation Layer (Phase 1)

| # | Feature | URL | Description |
|---|---------|-----|-------------|
| 1 | **Public Awareness Dashboard** | `/en` | Stats, org list, coverage gaps, sector flags |
| 2 | **Actor Intake Form** | `/en/intake` | Org onboarding: name, type, sectors, zones, contact |
| 3 | **Basic Static Map** | `/en/map` | Interactive SVG governorate map with coverage and gap indicators |
| 4 | **Open API v0** | `/api/v0/coverage` | Public JSON endpoints for coverage, gaps, orgs |

#### Identity Layer (Phase 1)

| # | Feature | URL | Description |
|---|---------|-----|-------------|
| 4b | **Shabaka Sign In** | `/en/platform/login` | Dedicated org-user and platform-admin access for actor-owned workflows |
| 5 | **Actor Registry** | `/en/actors` | Living org profiles with search, filter, freshness |
| 5 | **Actor Profile** | `/en/actors/a1` | Full profile: sectors, zones, capacity, vouch chain |
| 5b | **My Organization** | `/en/platform/me` | Signed-in org workspace with actor summary, sectors, zones, and capacity snapshot |
| 6 | **Capacity Cards** | `/en/capacity` | Per-org capacity: services, resources, stock levels |
| 6 | **Capacity Edit** | `/en/capacity/a1` | Toggle UI: switches, steppers, stock buttons (<90s) |
| 7 | **Peer Verification** | `/en/verification` | 3-stage trust: Pending → Provisional → Verified |
| 8 | **Arabic-First UI** | All pages | Bilingual AR/EN labels, RTL layout via CSS logical properties |

#### Visibility Layer (Phase 2)

| # | Feature | URL | Description |
|---|---------|-----|-------------|
| 9 | **Needs Board** | `/en/needs` | Real-time needs sorted by urgency (Red/Amber/Gray) |
| 10 | **Live Map** | `/en/map` | Governorate heatmap with sector filters, alert markers, and gap detail |
| 11 | **Resource Tracker** | `/en/resources` | Aggregate resources across all actors by zone |
| 12 | **Capacity Timeline** | `/en/timeline` | Change log, staleness alerts, pattern detection |
| 13 | **Urgency Alerts** | `/en/alerts` | One-tap alerts with 48h expiry & escalation |

#### Coordination Layer (Phase 2–3)

| # | Feature | URL | Description |
|---|---------|-----|-------------|
| 14 | **Collaboration System** | `/en/collaborate` | Capacity-need matching, joint operation workspaces |
| 15 | **Shared Task Board** | `/en/collaborate/jo1` | Kanban board: To Do / In Progress / Done / Blocked |
| 16 | **Flash Assessment** | `/en/assessment` | 10-question rapid assessment with zone snapshots |
| 17 | **Sector Planning** | `/en/planning` | Coverage plans & gap analysis matrix |
| 17b | **Secure Messaging** | `/en/messages` | E2E encrypted 1:1 and group threads |
| 17b | **Chat Thread** | `/en/messages/mt1` | Chat bubbles, read receipts, file sharing |

#### Infrastructure Layer (Phase 3–4)

| # | Feature | URL | Description |
|---|---------|-----|-------------|
| 18 | **WhatsApp Integration** | Settings | Opt-in WhatsApp/SMS for check-ins & alerts |
| 19 | **Community Feedback** | `/en/feedback` | Anonymous feedback via QR/URL with discrepancy detection |
| 20 | **Outcome Monitoring** | `/en/outcomes` | Network stats: families reached, collabs, gaps closed |
| 21 | **Advanced API v1** | `/en/api` | Authenticated endpoints, CSV/JSON export, time-series |
| 22 | **Privacy Controls** | `/en/settings` | Field-level visibility, offline mode, data export |
| 23 | **Multi-Region** | Settings | Region-scoped data with cross-region visibility |
| 23b | **Review Queue** | `/en/platform/review` | Platform-admin intake review queue with duplicate warnings |

#### Navigation

| Page | URL | Description |
|------|-----|-------------|
| More (Feature Hub) | `/en/more` | Links to all platform features by category |
| Shabaka Sign In | `/en/platform/login` | Entry point for organization and platform-admin accounts |
| My Organization | `/en/platform/me` | Signed-in org workspace |
| Review Queue | `/en/platform/review` | Signed-in platform-admin queue |
| API Documentation | `/en/api` | v0 + v1 endpoint docs with examples |

### API Endpoints

#### Public API v0 (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v0/coverage` | Sector coverage and org count by zone |
| GET | `/api/v0/gaps` | Zones with zero coverage per sector |
| GET | `/api/v0/orgs` | Public org list (no contact details) |

All v0 responses are JSON with `Cache-Control: max-age=1800` (30 min cache).

#### Authenticated API v1 (Planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/gaps` | Persistent gaps with time-series data |
| GET | `/api/v1/actors` | Verified actor list with sector/zone |
| GET | `/api/v1/resources` | Aggregate resource availability by zone |
| GET | `/api/v1/export` | Bulk CSV/JSON export of aggregated data |

## Platform Design Principles

Three non-negotiable constraints shape every decision:

| No Hierarchy | Freshness Over Precision | Works Under Crisis |
|-------------|--------------------------|-------------------|
| All verified actors are peers. No actor has authority over another. No designated "lead" per sector or zone. | Rough data updated today beats exact data from last week. Every data point shows a timestamp. Stale data is visually degraded. | Offline mode required. SMS fallback for critical alerts. Arabic RTL is the default. Must function during power cuts. |

### What Is Deliberately Out of Scope

- No donation or payment flows
- No individual beneficiary case files
- No reporting dashboards for external funders
- No star ratings or quality scores
- No single "cluster lead" per sector
- No centralized admin that can unilaterally remove actors

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Components | Custom + Radix UI primitives |
| Backend | Firebase (Firestore + Auth) |
| Platform Data | Firestore-backed platform API |
| Forms | React Hook Form + Zod 4 |
| i18n | next-intl (Arabic RTL default + English) |
| Unit Tests | Vitest + Testing Library |
| E2E Tests | Playwright (Chromium) |
| Anti-spam | Google reCAPTCHA v3 |
| Icons | Lucide React |

## Project Structure

```
src/
├── app/
│   ├── not-found.tsx                    # Root 404 (outside locale)
│   ├── global-error.tsx                 # Root error boundary (catches layout crashes)
│   └── [locale]/
│       ├── page.tsx                    # Landing page (Lebanon Relief)
│       ├── not-found.tsx               # 404 page (translated)
│       ├── error.tsx                   # Runtime error boundary (translated)
│       ├── loading.tsx                 # Loading skeleton
│       ├── (public)/                   # Request help, shelters, contacts
│       ├── (helper)/                   # Browse, request details, registration
│       ├── (admin)/                    # Admin dashboard, moderation
│       └── (platform)/                # Shabaka coordination platform
│           ├── page.tsx               # Platform dashboard
│           ├── layout.tsx             # Bottom nav + header
│           ├── actors/                # Actor registry + profile
│           ├── capacity/              # Capacity cards + edit
│           ├── needs/                 # Needs board
│           ├── map/                   # Live map (SVG governorate map + filters)
│           ├── alerts/                # Urgency alerts
│           ├── resources/             # Resource tracker
│           ├── timeline/              # Capacity timeline
│           ├── collaborate/           # Collaboration + task board
│           ├── messages/              # Secure messaging + threads
│           ├── assessment/            # Flash assessment
│           ├── planning/              # Sector planning + gap analysis
│           ├── verification/          # Peer verification network
│           ├── feedback/              # Community feedback
│           ├── outcomes/              # Outcome monitoring
│           ├── intake/                # Actor intake form
│           ├── platform/              # Shabaka sign-in, org workspace, admin review queue
│           ├── settings/              # Privacy controls
│           ├── api/                   # API documentation
│           └── more/                  # Navigation hub
├── components/
│   ├── ui/                            # Button, Input, Select, Card, etc.
│   └── shared/                        # RequestCard, LebanonMap, etc.
├── lib/
│   ├── firebase/                      # Firebase config + CRUD
│   ├── data/                          # Platform data layer
│   │   ├── platform-api.ts           # Firestore-backed platform data access
│   │   ├── synthetic.ts              # Seed/reference dataset for platform migration
│   │   └── zones.ts                  # 31 Lebanese zones + 9 sectors
│   ├── logger.ts                      # Structured logging (server: JSON, client: console)
│   ├── types/
│   │   ├── index.ts                  # Individual help request types
│   │   └── platform.ts              # Platform types (23 features)
│   ├── utils/                        # Helpers, cn, matching
│   └── validators/                   # Zod schemas
├── messages/                          # en.json, ar.json (full EN/AR coverage)
└── i18n/                              # Routing, navigation
```

## Data Architecture

### Existing Firebase Collections (Individual Help Requests)

| Collection | Purpose | Access |
|-----------|---------|--------|
| `requests` | Help requests | Public read, anyone create, admin update |
| `requests/{id}/private/contact` | Phone, name | Admin + claimed helper only |
| `helpers` | Helper profiles | Authenticated read, self-write |
| `claims` | Helper-to-request matches | Authenticated read, helper create |
| `admins` | Admin user records | Self-read only |
| `stats/global` | Aggregated counters | Public read |
| `shelters` | Cached ArcGIS shelter data | Public read |
| `contacts` | Emergency contacts | Public read, admin write |

### Platform Data Layer (Firestore-backed)

The platform now reads from Firestore through `src/lib/data/platform-api.ts`. The synthetic dataset in `src/lib/data/synthetic.ts` is retained as a deterministic seed source for local fixtures and remote seeding.

| Data Entity | Feature | Records |
|-------------|---------|---------|
| Actors | Actor Registry (#5) | 14 organizations |
| Capacity Cards | Capacity Cards (#6) | 8 cards with services, resources, stock |
| Vouches | Peer Verification (#7) | 5 vouching records |
| Needs | Needs Board (#9) | 11 open needs across zones |
| Urgency Alerts | Urgency Alerts (#13) | 3 active alerts |
| Collaborations | Collaboration (#14) | 3 requests (proposed/accepted) |
| Joint Operations | Collaboration (#14) | 2 active operations |
| Shared Tasks | Task Board (#15) | 5 tasks across 2 operations |
| Flash Assessments | Assessment (#16) | 1 completed with snapshot |
| Sector Plans | Planning (#17) | 2 coverage plans |
| Gap Analyses | Planning (#17) | 1 zone analysis |
| Message Threads | Messaging (#17b) | 3 threads (1:1 + group) |
| Messages | Messaging (#17b) | 5 messages |
| Community Feedback | Feedback (#19) | 3 submissions |
| Outcome Reports | Outcomes (#20) | 4 weekly reports |
| Pattern Alerts | Pattern Detection | 2 systemic gap alerts |
| Zones | Shared | 31 Lebanese zones in 4 regions |
| Sectors | Shared | 9 sector categories |

### Platform Firestore Collections

| Collection | Feature | Purpose |
|-----------|---------|---------|
| `actors` | 5 | Organization profiles |
| `capacity_cards` | 6 | Per-org current capacity |
| `capacity_cards/{id}/changelog` | 6, 12 | Per-field change history |
| `vouches` | 7 | Peer verification records |
| `needs` | 9 | Shared needs board entries |
| `urgency_alerts` | 13 | One-tap urgent need flags |
| `joint_operations` | 14 | Collaboration workspaces |
| `joint_operations/{id}/tasks` | 15 | Shared task board items |
| `flash_assessments` | 16 | Rapid assessment snapshots |
| `sector_plans` | 17 | Sector planning coverage |
| `messages` | 17b | E2E encrypted messages |
| `feedback` | 19 | Anonymous community feedback |
| `outcomes` | 20 | Self-reported impact data |
| `api_keys` | 21 | Authenticated API access |
| `zones` | Shared | Geographic zone reference |
| `intake_submissions` | 2 | Org onboarding queue |
| `platform_users` | Shared | Private auth-to-role mapping for Shabaka actor and platform-admin accounts |

## Shared Taxonomy

All features use the same sector taxonomy:

| Sector | Arabic | Color | Notes |
|--------|--------|-------|-------|
| Food | غذاء | `#22c55e` | Food parcels, hot meals, baby formula |
| Medical | طبي | `#ef4444` | Consultations, medications, wound care |
| Shelter | مأوى | `#3b82f6` | Emergency beds, collective centres |
| Psychosocial | دعم نفسي | `#a855f7` | Often most under-covered sector |
| Legal | قانوني | `#6366f1` | Documentation, legal aid, asylum |
| Logistics | لوجستيات | `#f97316` | Transport, vehicles, drivers, storage |
| WASH | مياه وصرف صحي | `#06b6d4` | Water, sanitation, hygiene kits |
| Education | تعليم | `#eab308` | Schooling, tutoring, literacy |
| Protection | حماية | `#ec4899` | Sensitive — extra privacy controls |

## Geographic Zones

31 named zones across 4 regions (neighborhood/district level):

| Region | Zones |
|--------|-------|
| **Beirut & Suburbs** | Bourj Hammoud, Dekwaneh, Sin El Fil, Sabra, Mar Elias, Haret Hreik, Hamra, Achrafieh, Cola, Tarik Jdide, Dahieh, Jnah |
| **South Lebanon** | Saida, Sour (Tyre), Nabatieh, Marjayoun, Bint Jbeil, Khiam |
| **Bekaa Valley** | Zahle, Baalbek, Hermel, Chtaura, Bar Elias, Anjar |
| **North Lebanon** | Tripoli, Bcharre, Zgharta, Batroun, Akkar, Halba, Mina |

The platform map is rendered from governorate SVG paths with distinct outlines for Bekaa and Baalbek-Hermel, and the current regression suite checks both map geometry and end-to-end filter behavior.

## Testing

### Unit Tests (Vitest)

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npx vitest run --coverage # Coverage report
```

The current Vitest suite focuses on helpers, matching logic, and validation flows, with full coverage across the tracked source files.

### E2E Tests (Playwright)

Playwright covers core platform flows, direct page navigation, and focused filter/map regressions. For day-to-day work, prefer the emulator-backed command so the suite runs against an isolated Firestore/Auth instance instead of live Firebase.

```bash
npm run test:e2e:emulator             # Safe default: fresh emulators + seed + Playwright
npm run test:integration              # Alias for the emulator-backed integration/E2E run
npm run test:all                      # Unit tests + emulator-backed Playwright
npx playwright test                    # Run E2E against the app/env you already started
npx playwright test e2e/filter-behavior.spec.ts  # Run focused filter + map regressions
npx playwright test --reporter=list    # Verbose output
npx playwright show-report             # View HTML report
```

The emulator-backed runner auto-selects free ports, uses its own Next.js build directory, and stores Playwright output, Vitest coverage, and Firebase emulator debug logs under `.test-artifacts/` (gitignored).

Additional focused coverage:

| Suite | Tests | Coverage |
|------|------:|----------|
| `more-page-links.spec.ts` | 38 | Feature hub links + direct page-load checks |
| `filter-behavior.spec.ts` | 6 | Map geometry, sector filters, actor filters, needs/resources/timeline filtering |

| Test Suite | Tests | Coverage |
|-----------|-------|----------|
| Feature 1: Public Dashboard | 2 | Landing page, no-auth access |
| Feature 2: Actor Intake Form | 6 | Fields, types, sectors, zones, language |
| Feature 3: Static Map | 3 | Interactive SVG map, gaps, sector filters |
| Feature 4: Open API v0 | 4 | Coverage, gaps, orgs, cache headers |
| Feature 5: Actor Registry | 4 | List, badges, profile, vouch chain |
| Feature 6: Capacity Cards | 3 | Overview, stock levels, edit mode |
| Feature 7: Peer Verification | 2 | Status categories, vouch counts |
| Feature 9: Needs Board | 4 | Urgency sort, details, "I Can Help", patterns |
| Feature 11: Resource Tracker | 2 | Aggregates, timestamps |
| Feature 12: Timeline | 1 | Change history |
| Feature 13: Urgency Alerts | 3 | Active alerts, escalation, flag button |
| Feature 14: Collaboration | 2 | Requests, matches |
| Feature 15: Task Board | 1 | Kanban board |
| Feature 16: Flash Assessment | 2 | Snapshots, aggregated results |
| Feature 17: Sector Planning | 2 | Coverage plans, gap matrix |
| Feature 17b: Messaging | 3 | Threads, encryption, chat bubbles |
| Feature 19: Feedback | 2 | Anonymous form, discrepancy flags |
| Feature 20: Outcomes | 2 | Network stats, disclaimer |
| Feature 21: API Docs | 1 | Endpoint documentation |
| Feature 22: Privacy Controls | 3 | Visibility, notifications, offline |
| Navigation & Layout | 3 | Bottom nav, more page, platform link |
| Backward Compatibility | 5 | Landing, requests, shelters, contacts, Arabic |
| **Core Feature Suite Total** | **60** | **Feature-level smoke coverage** |

## Commands

```bash
npm run dev              # Development server (port 4001)
npm run build            # Production build
npm run start            # Start production server
npm run test             # Unit tests (Vitest)
npm run test:watch       # Unit tests watch mode
npm run test:integration # Emulator-backed integration/E2E run
npm run test:e2e:emulator # Playwright against fresh Firestore/Auth emulators
npm run test:all         # Unit tests + emulator-backed Playwright
npm run lint             # Lint code
npm run seed             # Seed Firestore with sample data
npm run seed:platform    # Seed Firestore with platform data (safe conflict check)
npm run seed:platform:emulator # Reset + seed platform data in emulator
npx playwright test      # E2E tests (Playwright)
```

### CI

GitHub Actions runs lint, typecheck, unit tests, emulator-backed Playwright E2E, then the production build. The E2E job installs Java for the Firebase emulators, and failing Playwright runs upload `.test-artifacts/playwright/output` as a workflow artifact for debugging.

## Architecture Decisions

### Dual-Module Design
The app has two modules sharing the same codebase: individual help requests and organizational coordination. Both use Firebase-backed data flows while still sharing UI components, i18n infrastructure, and the Tailwind theme.

### Platform Data Layer
Platform features read from Firestore through `platform-api.ts` (`getActors()`, `getNeeds()`, etc.). The synthetic dataset remains available as a seed/fallback reference, but it is no longer the runtime source of truth.

### Anti-Fraud & Trust
- Manual moderation queue for help requests
- Peer verification (3 independent vouches) for organizations
- No central gatekeeper — trust flows from mutual recognition
- Founding cohort of 10–15 verified orgs as trust network roots

### Privacy & Safety
- No beneficiary case files ever stored
- Phone numbers in secure subcollections
- Field-level visibility controls (public/peers/private)
- Anonymous feedback with private discrepancy alerts
- Contact info access-controlled by verification status

### Error Handling
- Locale-level `error.tsx` catches runtime errors with translated UI and retry button
- Root `global-error.tsx` catches layout-level crashes with its own `<html>`/`<body>`
- Locale-level and root `not-found.tsx` for 404 pages
- `loading.tsx` skeleton for route transitions

### Performance
- Mobile-first design with 44px tap targets
- System fonts only — no web font downloads
- Static translations bundled in JS
- PWA manifest for mobile installation
- Low-bandwidth text-only mode (planned)

### Smart Matching
Pure client-side arithmetic — no AI/ML:
- Weighted scoring: governorate (50pts), category (30pts), availability (20pts)
- Priority sorting: `urgency × age × log₂(people_count)`
- Request clustering for route efficiency
- Capacity-need matching for organizational collaboration

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Firebase project configuration |
| `NEXT_PUBLIC_USE_EMULATORS` | No | Set `true` for Firebase emulators |
| `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST` | No | Override Firestore emulator host when not using the default `127.0.0.1` |
| `NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT` | No | Override Firestore emulator port when not using the default `8080` |
| `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL` | No | Override Auth emulator URL when not using the default `http://127.0.0.1:9099` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | No | reCAPTCHA v3 site key |
| `RECAPTCHA_SECRET_KEY` | No | reCAPTCHA v3 secret (server-side) |
| `NEXT_PUBLIC_LOG_LEVEL` | No | Log level: `debug`, `info`, `warn`, `error` (defaults to `debug` in dev, `warn` in prod) |
| `NEXT_PUBLIC_BASE_URL` | No | Base URL for OG images |

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication: Email/Password and Anonymous
3. Create a Firestore Database
4. Copy project config to `.env.local`
5. Deploy rules: `firebase deploy --only firestore:rules`
6. Deploy indexes: `firebase deploy --only firestore:indexes`
7. Seed data: `npm run seed`
8. Seed platform data: `npm run seed:platform`

### Emulator Test Workflow

Use this when you want integration/E2E coverage without touching live Firebase data:

```bash
npm run test:e2e:emulator
```

`npm run test:e2e:emulator` starts fresh Auth and Firestore emulators on free ports, resets Firestore, seeds the platform collections, then runs Playwright against that isolated environment. It does not need your live Firebase project credentials for the test run.

`npm run seed:platform:emulator` is available if you want to seed just the emulator data without running Playwright.

### Default Users (Development Only)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@relief.lb` | `admin123` |
| Helper | `helper@example.com` | `helper123` |
| Shabaka Platform Admin | `platformadmin@shabaka.lb` | `platform123` |
| Shabaka Actor Admin | `actor.a1@shabaka.lb` | `platform123` |

Shabaka users sign in at `/en/platform/login`. The platform admin lands in `/en/platform/review`, and the actor account lands in `/en/platform/me`.

> **Change all default passwords before production deployment.**

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the [MIT License](LICENSE).

## Security

To report a vulnerability, please see [SECURITY.md](SECURITY.md).

---

*A network built on trust, not authority. For the people on the ground, by the people on the ground.*

*شبكة مبنية على الثقة، لا على السلطة. من الناس على الأرض، للناس على الأرض.*
