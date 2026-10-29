# VELVET CODE — REAL ESTATE CRM SAAS PLATFORM
## Master Project Context & Development Memory

*Document created: October 2026 for Antigravity Session Continuity*  
*Repository Root: `D:\old laptop file\New Volume\velvetcode crm website`*

---

## 1. Project Purpose & High-Level Architecture

**Velvet Code Real Estate CRM** is a production-grade, multi-tenant SaaS application built for the Indian real estate market (real estate agencies, brokers, property consultants, and large builders/developers).

### Tech Stack
- **Framework**: Next.js 16.3.5 (App Router, Server Actions, Dynamic API Route Handlers)
- **Runtime**: Node.js (Vercel Production runs Node.js 24.x; Local runtime is Node.js v26.13.0)
- **UI & Design**: React 19.2.8, Tailwind CSS v4, Lucide React icons, Recharts, Canvas Confetti
- **Typography & Theme**: Inter font (Google Fonts / local fallback), luxury velvet dark & gold/cream aesthetic (`#C5A880`, `#D4AF37`, `#0F172A`)
- **Database Layer**:
  - PostgreSQL multi-tenant relational schema (configured via `pg` connection pool and defined in `prisma/schema.prisma`)
  - Serverless cloud persistence: Vercel Blob (`@vercel/blob`) with versioned atomic state snapshots (`velvet_state_<timestamp>.json`) and master snapshot (`velvet_db_cloud_master.json`)
  - Local disk fallback: `data/velvet-db.json` and `data/storage_objects/`
- **Object & File Storage**: Vercel Blob cloud storage with fallback to local binary storage (`data/storage_objects/`) with plan-based quotas
- **Authentication**: Custom PBKDF2 SHA-512 password hashing (16-byte salt, timing-safe verification), legacy bcrypt ($2b$) automatic on-login migration, stateless encrypted JWT session cookies
- **Payment & Subscriptions**: Official Razorpay Subscriptions integration with HMAC SHA-256 cryptographic verification, webhook idempotency, and automated 7-day trial expiry gates
- **Specialized Integrations**:
  - Meta WhatsApp Cloud API (3-column inbox, automated brochure dispatch, click-to-chat)
  - Realty AI Engine (Gemini / OpenAI lead scoring and property matchmaking)
  - Native Excel Report Generator (`exceljs` in-memory multi-tab luxury workbook generation with KPI summary tables)

---

## 2. Directory & File Inventory

```
velvetcode crm website/
├── .env.example                       # Canonical environment template (no secrets)
├── .env.local                         # Local environment configuration (restored)
├── .gitignore                         # Git ignore configuration
├── .vercel/
│   ├── project.json                   # Vercel project linkage (prj_8hdjEYEtASr0PzDasrPfcchEcHwq)
│   └── .env.production.local          # Production environment metadata
├── AGENTS.md                          # Antigravity Next.js agent operational rules
├── CLAUDE.md                          # Compatibility reference pointing to AGENTS.md
├── eslint.config.mjs                  # ESLint flat config with Next.js presets
├── next.config.ts                     # Next.js configuration
├── package.json                       # Dependencies & scripts
├── prisma/
│   └── schema.prisma                  # Full PostgreSQL multi-tenant schema
├── data/
│   ├── velvet-db.json                 # Local persistent database snapshot (11 orgs, 11 users)
│   └── storage_objects/               # Local binary upload cache
├── scripts/
│   ├── generate_leads_excel.py        # Python openpyxl lead export engine
│   ├── diagnose-razorpay.js           # Razorpay API diagnostics
│   └── setup-razorpay-plans.js        # Script to create/verify Razorpay plan IDs
├── src/
│   ├── app/
│   │   ├── (marketing)/               # /, /about, /contact, /features, /pricing, /privacy, /solutions, /terms
│   │   ├── admin/                     # Master SaaS Owner headquarters (/admin/dashboard, /admin/users, etc.)
│   │   ├── app/                       # Customer CRM workspace (/app/dashboard, /app/leads, /app/deals, etc.)
│   │   ├── api/                       # REST API route handlers (auth, leads, properties, billing, webhooks)
│   │   ├── login/, register/          # Authentication pages
│   │   ├── forgot-password/, reset-password/ # Password recovery flow
│   │   └── globals.css, layout.tsx    # Global styles & Inter typography
│   ├── components/
│   │   ├── layout/                    # CRMAppShell, AdminAppShell, Header, Footer, Modals
│   │   ├── marketing/                 # LandingHero, LandingSections
│   │   └── ui/                        # Button, Card, Input, Combobox, Modal, Badge, ImageUpload
│   ├── lib/
│   │   ├── auth-server.ts             # Server-side auth, session resolver, PBKDF2/bcrypt hashing
│   │   ├── server-db.ts               # Authoritative CRM server database, Vercel Blob sync & CRUD
│   │   ├── db.ts                      # PostgreSQL pool & schema initializer
│   │   ├── excel-service.ts           # Native Node.js Excel workbook generator (ExcelJS)
│   │   ├── storage-server.ts          # File & image upload handler with quota validation
│   │   ├── razorpay-server.ts         # Razorpay client, plan configurations, HMAC signature verify
│   │   ├── subscription-gate.ts       # 7-day trial & plan access gatekeeper
│   │   ├── store.tsx                  # Client-side React state & data synchronization
│   │   ├── ai-service.ts              # Realty AI prediction & recommendations
│   │   ├── mock-data.ts               # Seed data, default plans & limits
│   │   └── utils.ts                   # INR currency formatting (Lakhs/Crores), helpers
│   └── types/
│       └── index.ts                   # Central TypeScript interface & type definitions
├── tests/                             # 15+ automated verification suites
└── velvetcode crm website/            # Recovered nested duplicate backup copy (untracked)
```

---

## 3. GitHub & Deployment Details

- **GitHub Repository**: `https://github.com/srilakshman73/velvet-code-real-estate-crm.git`
- **Active Branch**: `main`
- **Latest Verified Commit**: `5eb4ac0693c8e097c594daa119f856746f3e5075`
- **Commit Message**: `fix: global Inter typography overhaul and owner-only registered user monitoring dashboard (/admin/users)`
- **Git History Integrity**: 100% intact; local `HEAD` matches `origin/main` exactly.
- **Production URL**: `https://velvet-code-real-estate-crm.vercel.app`
- **Vercel Project Association**:
  - `projectId`: `prj_8hdjEYEtASr0PzDasrPfcchEcHwq`
  - `orgId`: `team_GY61cFp0S3q6FrUa1Yg1NJtI`
  - `projectName`: `velvet-code-real-estate-crm`
  - Status: Intact in `.vercel/project.json`

---

## 4. Multi-Tenant Security & Authentication Architecture

1. **Owner vs. Customer Isolation**:
   - Master Platform Owner: `srilakshman73@gmail.com`
   - Owner has unrestricted access to `/admin/*`, global telemetry, user monitoring, and SaaS billing.
   - Owner is permanently exempt from subscription payments and trial gates.
   - Customers (`ADMIN`, `MANAGER`, `AGENT`) are restricted strictly to `/app/*` and their own `organization_id`.
   - Any customer request claiming `role: 'OWNER'` is sanitized to `ADMIN`.
2. **Multi-Tenant Boundary Enforcement**:
   - Backend routes derive `organization_id` strictly from HTTP-only session cookies.
   - User-supplied `organization_id` in request bodies is discarded for non-owner accounts.
   - Cross-tenant queries return `403 Forbidden` (`TENANT_MISMATCH`).
3. **Password Security**:
   - PBKDF2 SHA-512 hashing with 16-byte random salt and timing-safe comparison (`crypto.timingSafeEqual`).
   - Legacy bcrypt hashes (`$2b$`) are verified and automatically upgraded to PBKDF2 on the user's next login.

---

## 5. Subscription Plans & Razorpay Configuration

### Plans & Pricing
| Plan | Price (INR/mo) | Amount (Paise) | Razorpay Plan ID | Limits |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** | ₹1,999 | 199900 | `plan_TmTRbhyJaA79AW` | 1 User, 100 Leads, 25 Properties, 1 GB Storage, 100 AI queries |
| **Professional** | ₹5,999 | 599900 | `plan_TmTT05HGnKjDq3` | 5 Users, 1,000 Leads, Unlimited Properties, 5 GB Storage, 1,000 AI queries, WhatsApp CRM |
| **Business** | ₹9,999 | 999900 | `plan_TmTTrXM6JxkG6k` | 15 Users, Unlimited Leads & Properties, 25 GB Storage, 5,000 AI queries, Full Automation |

### Free Trial & Expiry Rules
- Every new customer registration receives an automatic **7-day free trial** of the Starter tier.
- While trial is active (`currentPeriodEnd > Date.now()`), full CRM workspace access is granted.
- Once expired, the user is transitioned to `PAYMENT_REQUIRED` / `EXPIRED`, direct access is blocked with HTTP 402, and the UI displays the Trial Expiry Modal directing them to `/app/billing`.
- Customer business data (leads, properties, deals) is **never deleted** upon trial expiration or cancellation.

---

## 6. Environment Variables Reference (Key Names Only)

### SaaS Master Owner
- `OWNER_EMAIL`
- `OWNER_PASSWORD`

### App & Branding
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_COMPANY_TAGLINE`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_DISPLAY`

### Database & Storage
- `DATABASE_URL` (or `POSTGRES_URL`, `POSTGRES_PRISMA_URL`)
- `BLOB_READ_WRITE_TOKEN`
- `BLOB_STORE_ID`
- `BLOB_WEBHOOK_PUBLIC_KEY`
- `CLOUDINARY_CLOUD_NAME` (fallback)
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Authentication
- `AUTH_SECRET`
- `JWT_SECRET`
- `NEXTAUTH_URL`

### Razorpay Payments
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `RAZORPAY_STARTER_PLAN_ID`
- `RAZORPAY_PROFESSIONAL_PLAN_ID`
- `RAZORPAY_BUSINESS_PLAN_ID`

### Third-Party APIs
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_API_TOKEN`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `AI_API_KEY`

### Trial Controls
- `ENABLE_FREE_TRIAL` (default: true)
- `TRIAL_PERIOD_DAYS` (default: 7)
- `REQUIRE_PAYMENT_IMMEDIATELY` (default: false)

---

## 7. Development & Build Instructions

### Recommended Commands on Windows
- **Run dev server**:
  ```bash
  npm.cmd run dev
  ```
- **Type check**:
  ```bash
  npx.cmd tsc --noEmit
  ```
- **Production build**:
  ```bash
  npx.cmd next build --webpack
  ```
  *(Note: Turbopack currently encounters a child-process IPC issue with Node.js v26 on Windows; `--webpack` builds cleanly and reliably).*
- **Run security test suite**:
  ```bash
  node tests/security-runner.js
  ```
- **Run functional CRM verification**:
  ```bash
  npx.cmd tsx tests/crm-functional-verification.js
  ```
- **Run Razorpay billing test suite**:
  ```bash
  npx.cmd tsx tests/razorpay-billing-runner.js
  ```
- **Run storage and calendar verification**:
  ```bash
  node tests/storage-and-calendar-verification.js
  ```
- **Run production repair audit**:
  ```bash
  npx.cmd tsx tests/production-repair-audit.js
  ```
- **Run font and user monitoring audit**:
  ```bash
  npx.cmd tsx tests/verify-font-and-admin-users.ts
  ```

---

## 8. Current Implementation Status & Next Steps

### Completed Features
- [x] Multi-tenant registration, login, session validation, and password recovery.
- [x] Master Owner administration console (`/admin/dashboard`, `/admin/users`, `/admin/subscriptions`, `/admin/organizations`, `/admin/payments`).
- [x] Customer CRM workspace (`/app/dashboard`, `/app/leads`, `/app/properties`, `/app/deals`, `/app/calendar`, `/app/site-visits`, `/app/tasks`, `/app/team`, `/app/billing`).
- [x] Dual-layer persistence with Vercel Blob atomic versioning & local fallback.
- [x] 7-day free trial, trial countdown banner, and expiry popup modal.
- [x] Razorpay subscription integration, HMAC signature verification, and webhook handling.
- [x] Lead budget zero-strip normalization and custom lead statuses.
- [x] File and cover photo uploads with 10MB limit and storage quota enforcement.
- [x] Global typography overhaul using Inter font across all headings and cards.
- [x] Native Node.js Excel workbook generator (`exceljs`) replacing external Python dependency with in-memory 4-sheet generation (`/api/leads/export`).
- [x] 100% clean ESLint passing (resolved `prefer-const` warnings).

### Known Environmental Issues & Non-Breaking Notes
1. **Node 26 Turbopack vs. Webpack**: In the local Windows environment with Node.js v26.13.0, `next build` with Turbopack encounters a PostCSS worker process IPC error. Using `npx.cmd next build --webpack` compiles all 68 routes with 100% success.
2. **Nested Duplicate Folder**: A duplicate directory `velvetcode crm website/` was created during recovery. It contains an exact copy of the project files. It should be kept safe or added to `.gitignore` to avoid redundant tooling scans.

