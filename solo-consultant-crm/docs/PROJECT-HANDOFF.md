# Solo Consultant CRM — Project Handoff

## Project Summary

A complete, production-ready CRM web application built for independent consultants to track leads through a visual pipeline, manage client relationships, create and send professional invoices with PDF generation and email delivery, and monitor business performance through an analytics dashboard.

**Built with:** Next.js 16 (App Router) · TypeScript · Supabase (PostgreSQL + Auth + Storage) · TailwindCSS · shadcn/ui · @dnd-kit · recharts · @react-pdf/renderer · Resend

---

## Architecture Overview

```
Browser ──→ Next.js App (Vercel)
                │
                ├── React Server Components (data fetching)
                ├── Server Actions (mutations + validation)
                ├── API Routes (PDF generation, cron jobs)
                │
                └──→ Supabase
                      ├── PostgreSQL (6 tables, RLS-protected)
                      ├── Auth (email/password, cookie sessions)
                      ├── Storage (logo uploads)
                      └── Row Level Security (all data scoped to user)
```

### Key Design Decisions
- **Server Components by default** — All data-fetching pages are Server Components; `'use client'` only for interactive elements (forms, drag-and-drop, charts)
- **Server Actions for mutations** — All CRUD operations go through validated Server Actions with auth checks and activity logging
- **Row Level Security** — Every table has RLS policies scoped to `auth.uid()`, ensuring data isolation per user
- **Lazy Resend initialization** — Email client initialized on-demand to avoid build errors without API key

---

## Repository Structure

```
solo-consultant-crm/
├── .github/workflows/       # CI/CD pipelines
│   ├── ci.yml               # Lint + typecheck + test + build
│   └── deploy-preview.yml   # Vercel preview deployments on PRs
├── docs/
│   ├── deployment-runbook.md # Step-by-step deployment guide
│   └── PROJECT-HANDOFF.md   # This file
├── supabase/migrations/     # 9 SQL migration files (run in order)
│   ├── 00001_create_enums.sql
│   ├── 00002_create_profiles.sql
│   ├── 00003_create_leads.sql
│   ├── 00004_create_clients.sql
│   ├── 00005_create_invoices.sql
│   ├── 00006_create_activity_log.sql
│   ├── 00007_create_rls_policies.sql
│   ├── 00008_create_storage.sql
│   └── 00009_create_triggers.sql
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages (login, signup, forgot-password, callback)
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── actions.ts    # Dashboard metrics server action
│   │   │   ├── clients/      # Client pages + server actions
│   │   │   ├── dashboard/    # Dashboard page
│   │   │   ├── invoices/     # Invoice pages + server actions
│   │   │   ├── leads/        # Pipeline pages + server actions
│   │   │   └── settings/     # Settings page + server actions
│   │   ├── api/              # API routes (PDF download, cron)
│   │   ├── layout.tsx        # Root layout (fonts, theme, toaster)
│   │   └── page.tsx          # Root redirect (auth check)
│   ├── components/
│   │   ├── clients/          # Client table, form, detail
│   │   ├── dashboard/        # Metrics cards, charts, activity feed
│   │   ├── invoices/         # Invoice table, form, detail, PDF preview
│   │   ├── layout/           # Sidebar, header, mobile nav, page header
│   │   ├── leads/            # Pipeline board, columns, cards, forms
│   │   ├── settings/         # Settings form
│   │   ├── shared/           # Empty state, skeletons, confirm dialog, displays
│   │   └── ui/               # shadcn/ui primitives
│   ├── hooks/                # useDebounce
│   └── lib/
│       ├── email/            # Resend integration
│       ├── pdf/              # @react-pdf/renderer invoice template
│       ├── supabase/         # Client, server, middleware helpers
│       ├── types/            # TypeScript types + ActionResult
│       ├── validations/      # Zod schemas
│       └── utils.ts          # cn(), formatCurrency(), formatDate()
├── tests/                    # 171 tests (Vitest)
├── vercel.json               # Vercel config (security headers, cron)
├── Dockerfile                # Docker multi-stage build
├── docker-compose.yml        # Self-hosted deployment
└── .env.local.example        # Environment variables template
```

---

## Database Schema

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | Business settings per user | business_name, invoice_prefix, default_tax_rate, currency, logo_url |
| `leads` | Pipeline leads | name, email, company, stage (6 stages), estimated_value, position |
| `clients` | Client database | name, email, company, address, is_archived |
| `invoices` | Invoice headers | invoice_number, status (draft/sent/paid/overdue), subtotal, tax, total |
| `invoice_items` | Line items | description, quantity, unit_price, amount, position |
| `activity_log` | Audit trail | type, description, entity_type, entity_id, metadata |

**4 Custom ENUMs:** `lead_stage`, `lead_source`, `invoice_status`, `activity_type`

---

## API / Server Actions

### Leads Module
| Action | Description |
|--------|-------------|
| `getLeadsByStage()` | Fetch all leads grouped by pipeline stage |
| `createLead(input)` | Create lead with Zod validation + activity log |
| `updateLead(id, input)` | Update lead fields, log stage changes |
| `deleteLead(id)` | Permanently delete a lead |
| `convertLeadToClient(leadId)` | Create client from lead data, link records |
| `updateLeadPositions(updates)` | Batch reorder after drag-and-drop |

### Clients Module
| Action | Description |
|--------|-------------|
| `getClients(search?)` | List active clients with optional search |
| `getClientById(id)` | Fetch client with invoice statistics |
| `getClientInvoices(clientId)` | Fetch all invoices for a client |
| `createClient(input)` | Create client with validation |
| `updateClient(id, input)` | Update client fields |
| `archiveClient(id)` | Soft-delete (set is_archived) |

### Invoices Module
| Action | Description |
|--------|-------------|
| `getInvoices(status?)` | List all invoices with client names |
| `getInvoiceById(id)` | Fetch invoice with items and client |
| `createInvoice(input)` | Create with auto-number, line items, calculated totals |
| `updateInvoiceStatus(id, status)` | Change status + log activity |
| `deleteInvoice(id)` | Delete drafts only |
| `sendInvoice(id)` | Generate PDF → email via Resend → update to "sent" |

### Other
| Action | Description |
|--------|-------------|
| `getDashboardMetrics(period?)` | Aggregated revenue, pipeline, activity data |
| `getProfile()` / `updateProfile(input)` | Business profile CRUD |
| `uploadLogo(formData)` | Upload to Supabase Storage |
| `GET /api/invoices/[id]/pdf` | Download invoice as PDF |
| `GET /api/cron/check-overdue-invoices` | Daily cron to mark overdue invoices |

---

## Pages & Features

| Route | Feature | Key UI |
|-------|---------|--------|
| `/login` | Email/password authentication | Card form, centered layout |
| `/signup` | User registration | Card form with password confirmation |
| `/forgot-password` | Password reset | Email-only form with success state |
| `/dashboard` | Business overview | 4 metric cards, revenue chart, pipeline bar, activity timeline |
| `/leads` | Visual pipeline (Kanban) | 6-column drag-and-drop board, lead cards, add lead dialog |
| `/leads/[id]` | Lead detail | Contact info, stage selector, convert-to-client CTA, activity |
| `/clients` | Client database | Searchable table, pagination, archive/restore |
| `/clients/new` | Add client | Validated form (name, email, phone, company, address, notes) |
| `/clients/[id]` | Client profile | Contact cards, revenue stats, invoice history table |
| `/invoices` | Invoice management | Status filter tabs (All/Draft/Sent/Paid/Overdue), paginated table |
| `/invoices/new` | Create invoice | Client selector, date pickers, dynamic line items, live totals |
| `/invoices/[id]` | Invoice preview | Paper-style layout, download PDF, send email, mark paid |
| `/settings` | Business settings | Profile form, logo upload, invoice defaults, theme toggle, sign out |

---

## Test Coverage

**171 tests passing** (Vitest + @testing-library/react)

| Category | Tests | What's Covered |
|----------|-------|----------------|
| Zod Validations | 79 | All 7 schemas — required fields, bounds, enums, coercion |
| Utility Functions | 27 | cn(), formatCurrency(), formatDate(), formatRelativeDate() |
| Type Constants | 19 | All stage/source/status constant maps |
| Component Smoke Tests | 46 | 6 shared components — rendering, props, accessibility |

Run tests: `npm test`

---

## Deployment Options

### Option 1: Vercel (Recommended)
See `docs/deployment-runbook.md` for complete instructions.
1. Create Supabase project → get API keys
2. Run 9 SQL migrations in order
3. Create Resend account → get API key
4. Connect repo to Vercel → set environment variables → deploy

### Option 2: Docker Self-Hosted
```bash
cp .env.local.example .env.local
# Fill in all values
docker-compose up -d
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `RESEND_API_KEY` | Yes | Resend API key for invoice emails |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app's public URL |
| `CRON_SECRET` | Optional | Secret for cron job authentication |

---

## Known Limitations & Future Roadmap

### Current Limitations
- Single-user only (no team/multi-user features)
- No recurring invoices
- No payment gateway integration (manual "mark as paid")
- No file attachments on leads/clients
- No reporting/export beyond dashboard charts

### Recommended P1 Enhancements
1. **Recurring invoices** — Auto-generate on schedule
2. **Stripe/PayPal integration** — Accept payments directly
3. **Email templates** — Customizable invoice email content
4. **CSV export** — Export clients, invoices, leads
5. **Client portal** — Clients can view/pay invoices online
6. **Calendar integration** — Schedule meetings from lead/client detail

### Recommended P2 Enhancements
1. **Multi-currency** per client (currently global setting)
2. **Tax presets** by region
3. **Expense tracking** module
4. **Contracts/proposals** module
5. **Time tracking** with invoice line item integration
6. **Mobile PWA** offline support

---

## Monitoring Checklist

- [ ] Vercel Analytics enabled (Core Web Vitals)
- [ ] Sentry error tracking configured
- [ ] Uptime monitoring active (UptimeRobot/BetterUptime)
- [ ] Supabase database alerts configured
- [ ] Daily cron job verified (overdue invoice checker)
- [ ] Backup strategy in place (Supabase daily backups on Pro plan)

---

*Built with the 7-Phase Platform Orchestrator workflow. All code is production-quality TypeScript with Zod validation, Row Level Security, and accessible UI components.*
