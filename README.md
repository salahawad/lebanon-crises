# Lebanon Relief — Humanitarian Coordination App

A mobile-first web app connecting displaced people with volunteers and organizations who can help. Built for low-bandwidth, low-end devices, and stressful conditions.

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
- **1 admin user**: `admin@relief.lb` / `admin123`
- **1 helper user**: `helper@example.com` / `helper123`
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

## Project Structure

```
src/
├── app/
│   └── [locale]/              # i18n routing
│       ├── page.tsx            # Landing page
│       ├── (public)/           # Request help, success
│       ├── (helper)/           # Browse, request details, registration
│       ├── (admin)/            # Dashboard, moderation, login
│       ├── privacy/            # Privacy notice
│       └── terms/              # Terms & humanitarian notice
├── components/
│   ├── ui/                     # Button, Input, Select, Card, etc.
│   └── shared/                 # RequestCard, UrgencyBadge, FilterSheet, etc.
├── lib/
│   ├── firebase/               # Config, auth, requests, helpers
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Helpers, cn
│   └── validators/             # Zod schemas
├── messages/                   # en.json, ar.json
└── i18n/                       # Routing, navigation, request config
```

## User Flows

### "I Need Help" (Requester)
1. Landing page → tap "I need help"
2. Fill minimal form: category, description, location, urgency, contact preference
3. Submit → get reference code
4. No login required (anonymous submission)

### "I Want to Help" (Helper)
1. Landing page → tap "I want to help"
2. Browse paginated requests with filters (category, area, urgency)
3. View request details (privacy-safe: no exact address, no phone shown)
4. Register → claim a request → contact via admin coordination or direct

### Admin
1. Sign in at `/admin/login`
2. Dashboard with live stats (single Firestore read)
3. Moderation: change status, flag requests, view contact info, export CSV

## Architecture Decisions

### Cost Optimization (Firebase)
- **Stats document**: Single `stats/global` doc for dashboard counters instead of aggregation queries. Updated via `increment()` on writes.
- **Pagination**: All list views paginate with Firestore cursors (20-50 items).
- **No real-time listeners**: All data fetched on-demand with `getDocs()` to avoid persistent connection costs.
- **Indexed queries**: Composite indexes pre-configured for common filter combinations.
- **Contact data separation**: Private subcollection `requests/{id}/private/contact` — only read when needed by authorized users.

### Privacy & Safety
- **No exact addresses collected** — only governorate, city, and general area.
- **Phone numbers in subcollection** — not readable from public request list.
- **Contact info access-controlled** — only admins and claimed helpers can read.
- **Anonymous submission** — requesters don't need accounts.
- **Client-side rate limiting** — prevents spam submissions.
- **Firestore security rules** — enforce read/write permissions.

### Performance
- **Mobile-first design** — 44px minimum tap targets, high contrast, minimal JS.
- **No heavy libraries** — no maps by default, no rich text editors.
- **System fonts** — no web font downloads.
- **Static translations** — bundled in JS, no Firestore reads for i18n.
- **PWA manifest** — installable on mobile devices.

### Authentication Strategy
- **Requesters**: Anonymous (Firebase Anonymous Auth) — zero friction.
- **Helpers**: Email/password registration — lightweight, no phone OTP cost.
- **Admins**: Email/password + `admins` collection check — secure without expensive provider.
- **Modular**: Phone auth can be added later without restructuring.

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

## i18n

- English (`/en/...`) — LTR
- Arabic (`/ar/...`) — RTL with full layout mirroring
- Language switcher on every page
- All UI text in `src/messages/en.json` and `src/messages/ar.json`

## Future Roadmap

- [ ] WhatsApp/SMS notifications via Cloud Functions
- [ ] Phone OTP authentication (optional, cost-aware)
- [ ] Verified organization badges for helpers
- [ ] Offline draft saving for request form
- [ ] Admin analytics dashboard with charts
- [ ] Request search by reference code
- [ ] Soft delete with audit trail
- [ ] Image upload for requests (Firebase Storage)
- [ ] Map view (optional, lightweight)
- [ ] Push notifications via FCM

## License

This project is provided for humanitarian purposes. Use freely for non-commercial humanitarian coordination.
