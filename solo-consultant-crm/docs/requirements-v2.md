# AI Dev Squad — Platform Requirements v2

> **Version:** 2.0
> **Date:** 2026-04-13
> **Status:** Approved (high-autonomy mode)
> **Scope:** Transform existing Solo Consultant CRM into AI Dev Squad Consulting Platform

---

## 1. Product Vision & Branding

### Name Options (Ranked)
1. **AI Dev Squad** — strong, action-oriented, memorable. Implies a team of AI agents working together.
2. **SquadBuild AI** — emphasizes the build process
3. **BuildSquad.ai** — domain-friendly alternative

**Selected:** AI Dev Squad

### Tagline
> "Websites, apps, CRMs & ERPs — built by AI agents in days, not months."

### Secondary Taglines
- "Your AI development team, on demand."
- "White-glove AI consulting. Production-grade results."

### Value Proposition
High-ticket AI consulting where clients get a dedicated squad of 7 specialized AI agents orchestrated by a human consultant. Clients pay for outcomes (a production-ready digital product), not hours. The 7-phase lifecycle ensures quality, transparency, and predictability — clients see real-time progress through their portal.

### Brand Personality
- **Professional** but not corporate — approachable tech expertise
- **Fast** — "days, not months" is the core promise
- **Transparent** — clients see every phase in real time
- **Premium** — white-glove positioning, not a cheap AI tool

---

## 2. Target User Personas

### Persona A: Rafael (Admin / Consultant)
- **Role:** Solo AI consultant, platform owner
- **Goals:** Manage sales pipeline, onboard clients, trigger AI builds, deliver projects, invoice clients
- **Pain Points:** Needs a single platform for CRM + project delivery tracking; wants to demonstrate professionalism with a client portal
- **Tech Comfort:** Expert — manages the full stack
- **Key Workflows:** Lead qualification → client conversion → project creation → trigger build → monitor phases → deliver → invoice

### Persona B: The Client (Business Owner / Stakeholder)
- **Role:** Business owner or decision-maker who purchased an AI-built product
- **Goals:** See project progress, provide feedback, access deliverables, feel informed and in control
- **Pain Points:** Hates being in the dark about project status; wants to check progress without sending emails
- **Tech Comfort:** Moderate — expects a clean, simple interface
- **Key Workflows:** Receive portal invite → log in → view project phases → see what's done → download deliverables

---

## 3. Feature List by Module

### Module A: Public Marketing Landing Page (P0 — MVP)

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| A1 | Hero Section | P0 | Headline + subheading + "Get a Quote" CTA. Animated gradient or tech-forward design. |
| A2 | Services Grid | P0 | 6-8 cards: Websites, Landing Pages, Web Apps, Mobile Apps, CRMs, ERPs, E-commerce, Internal Tools |
| A3 | How It Works | P0 | 7-step visual process: Research → Planning → Design → Frontend → Backend → Testing → Deployment |
| A4 | Pricing Tiers | P0 | 3 tiers: Starter ($2,500-$5,000), Professional ($10,000-$25,000), Enterprise ($25,000+). Placeholder. |
| A5 | Social Proof | P0 | Testimonials section (placeholder data), "Built X projects" counter |
| A6 | CTA Section | P0 | "Book a Discovery Call" or "Get a Free Quote" with contact form or Calendly embed |
| A7 | Footer | P0 | Links, copyright, social icons |
| A8 | SEO Meta | P0 | Open Graph tags, structured data, meta descriptions |
| A9 | Mobile Responsive | P0 | Fully responsive at all breakpoints |
| A10 | Dark/Light Mode | P1 | Respect system preference, toggle in nav |

### Module B: Extended CRM — Admin Only (P0 — MVP)

**B1: Keep Existing (No Changes)**
| Feature | Status |
|---------|--------|
| Leads Pipeline (Kanban) | Keep as-is |
| Client Database | Keep as-is |
| Invoice Module (create, send, PDF) | Keep as-is |
| Settings (business profile) | Keep as-is |
| Activity Log | Keep as-is |

**B2: Extend Dashboard**
| # | Feature | Priority |
|---|---------|----------|
| B2a | Project metrics cards (Active Projects, Completed, In Progress) | P0 |
| B2b | Project phase status overview | P0 |
| B2c | Revenue from projects (linked to invoices) | P1 |

**B3: AI Projects Module (NEW — P0)**
| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| B3a | Projects list page | P0 | Table with name, client, type, status, created date, actions |
| B3b | Create project | P0 | Form: name, description, type (enum), client (select), estimated value, notes |
| B3c | Project detail page | P0 | Full project view with phase tracker, comments, deliverables |
| B3d | Phase tracker | P0 | Visual 7-phase progress bar. Each phase: status badge, start/end dates, notes |
| B3e | Phase status updates | P0 | Admin can manually update each phase status (pending → in_progress → completed → failed) |
| B3f | Project comments | P0 | Admin can add comments per phase (visible to client in portal) |
| B3g | Deliverables | P1 | File upload per phase (links to Supabase Storage). Marked as "client-visible" or "internal only" |
| B3h | Trigger Build | P0 | Button that sets project status to "in_progress" and first phase to "in_progress" |
| B3i | Project type enum | P0 | website, landing_page, web_app, mobile_app, crm, erp, ecommerce, internal_tool, other |
| B3j | Overall status enum | P0 | draft, approved, in_progress, review, completed, delivered, cancelled |
| B3k | Link to client | P0 | Each project belongs to a client (FK) |
| B3l | Link to invoice | P1 | Optional FK to invoice for billing tracking |

**B4: Navigation Update**
| # | Feature | Priority |
|---|---------|----------|
| B4a | Add "Projects" item to sidebar (between Pipeline and Clients) | P0 |
| B4b | Badge showing active project count | P1 |

**B5: Role-Based Access Control**
| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| B5a | User roles: admin, client | P0 | Stored in profiles table |
| B5b | Admin access: full CRM (leads, clients, invoices, projects, settings, dashboard) | P0 |
| B5c | Client access: portal only (their projects, read-only) | P0 |
| B5d | Middleware enforcement | P0 | Route-level role checking |

### Module C: Client Portal (P1)

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| C1 | Client login | P1 | Same Supabase Auth, different post-login redirect based on role |
| C2 | Portal dashboard | P1 | List of client's projects with status summary |
| C3 | Project progress view | P1 | 7-phase visual tracker showing completed/in-progress/pending |
| C4 | Phase detail view | P1 | Per-phase: status, admin comments (read-only), deliverable downloads |
| C5 | Deliverable downloads | P1 | Client can download files marked as "client-visible" |
| C6 | Branded portal | P2 | Custom header with AI Dev Squad branding |
| C7 | Email notifications | P2 | Notify client when phase completes or deliverable uploaded |

---

## 4. User Stories

### Module A: Landing Page

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| A-US1 | As a visitor, I can see what AI Dev Squad offers so I understand the value proposition | Hero section loads with headline, subheading, CTA button |
| A-US2 | As a visitor, I can browse services so I know what types of products can be built | Services grid shows 6+ product types with descriptions |
| A-US3 | As a visitor, I can understand the build process so I feel confident in the methodology | 7-step "How It Works" section clearly explains each phase |
| A-US4 | As a visitor, I can see pricing tiers so I can self-qualify before reaching out | 3 pricing cards with tier names, price ranges, and included features |
| A-US5 | As a visitor, I can submit a quote request so I can start a conversation | CTA form captures name, email, project type, and description |
| A-US6 | As a visitor, I can read testimonials so I trust the service | Testimonials section with at least 3 placeholder reviews |

### Module B: AI Projects (Admin)

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| B-US1 | As admin, I can create a new AI project linked to a client so I can track the build | Project form saves to DB with name, description, type, client_id |
| B-US2 | As admin, I can view all projects in a table so I have an overview | Projects page shows sortable table with filters |
| B-US3 | As admin, I can see a project's 7-phase progress so I know the current state | Detail page shows phase tracker with status per phase |
| B-US4 | As admin, I can update a phase's status so I can track progress | Clicking a phase opens status selector; change persists to DB |
| B-US5 | As admin, I can add comments to a phase so I can document decisions and progress | Comment form on phase detail; comments stored with timestamp |
| B-US6 | As admin, I can trigger a build so the project moves from "approved" to "in_progress" | "Start Build" button changes project status and Phase 1 status |
| B-US7 | As admin, I can see project metrics on the dashboard so I have a business overview | Dashboard shows Active Projects, Completed, In Progress counts |
| B-US8 | As admin, I can link a project to an invoice so billing is tracked | Optional invoice_id field on project |
| B-US9 | As admin, I can delete or cancel a project | Cancel button sets status to "cancelled" |

### Module C: Client Portal

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| C-US1 | As a client, I can log in and see my projects so I know what's being built | Portal dashboard shows client's projects with current status |
| C-US2 | As a client, I can view a project's phase progress so I know what's done | Visual phase tracker shows 7 phases with status indicators |
| C-US3 | As a client, I can read admin comments on each phase so I'm informed | Phase detail shows timestamped comments from admin |
| C-US4 | As a client, I can download deliverables so I receive the final product | Download buttons on client-visible deliverables |
| C-US5 | As a client, I CANNOT access the admin CRM, other clients, or trigger builds | Middleware blocks /dashboard, /leads, /clients, /invoices routes for client role |

---

## 5. What to KEEP from Existing CRM

| Module | Files | Changes Needed |
|--------|-------|---------------|
| **Leads Pipeline** | src/app/(dashboard)/leads/*, src/components/leads/* | No changes. Works as-is. |
| **Client Database** | src/app/(dashboard)/clients/*, src/components/clients/* | No changes to existing. New projects linked via FK. |
| **Invoices** | src/app/(dashboard)/invoices/*, src/components/invoices/* | No changes. Projects optionally link to invoices. |
| **Dashboard** | src/app/(dashboard)/dashboard/*, src/components/dashboard/* | EXTEND: Add project metrics cards. |
| **Settings** | src/app/(dashboard)/settings/*, src/components/settings/* | No changes. |
| **Auth** | src/app/(auth)/*, middleware.ts | EXTEND: Add role-based routing. |
| **Shared Components** | src/components/shared/*, src/components/ui/* | Keep all. Add new shared components as needed. |
| **Supabase Helpers** | src/lib/supabase/* | Keep as-is. |
| **Types & Validations** | src/lib/types/*, src/lib/validations/* | EXTEND: Add project types and schemas. |
| **PDF & Email** | src/lib/pdf/*, src/lib/email/* | Keep as-is. |
| **Utils** | src/lib/utils.ts | Keep as-is. |

---

## 6. What to ADD

### New Route Groups
```
src/app/(marketing)/          # Public landing page (no auth required)
  page.tsx                    # Landing page
  layout.tsx                  # Marketing layout (different nav from dashboard)

src/app/(portal)/             # Client portal (client role only)
  layout.tsx                  # Portal layout (simplified nav)
  portal/page.tsx             # Portal dashboard — client's projects
  portal/projects/[id]/page.tsx  # Project progress view
```

### New Dashboard Routes
```
src/app/(dashboard)/projects/         # Admin projects list
  page.tsx
  new/page.tsx                        # Create project
  [id]/page.tsx                       # Project detail with phase tracker
  [id]/edit/page.tsx                  # Edit project
  actions.ts                          # Server actions
```

### New Components
```
src/components/marketing/     # Landing page sections
  hero.tsx
  services-grid.tsx
  how-it-works.tsx
  pricing-tiers.tsx
  testimonials.tsx
  cta-section.tsx
  marketing-header.tsx
  marketing-footer.tsx

src/components/projects/      # Admin project management
  project-table.tsx
  project-form.tsx
  project-detail.tsx
  phase-tracker.tsx
  phase-status-badge.tsx
  phase-comments.tsx
  trigger-build-button.tsx

src/components/portal/        # Client portal
  portal-header.tsx
  portal-sidebar.tsx
  portal-project-card.tsx
  portal-phase-tracker.tsx
  portal-phase-detail.tsx
  portal-deliverables.tsx
```

### New Database Tables
- `projects` — AI project records
- `project_phases` — 7 phases per project with status tracking
- `project_comments` — Comments on phases (admin writes, client reads)
- `project_deliverables` — File links per phase (P1)

### Schema Extensions
- `profiles` table: Add `role` column (admin | client, default: admin)
- `activity_type` enum: Add project-related types

---

## 7. Constraints & Assumptions

### Technical Constraints
- **Same stack:** Next.js 16 + Supabase + shadcn/ui + TailwindCSS
- **Same Supabase project:** Extend schema with new migrations; don't recreate existing tables
- **Same Vercel deployment:** Single deployment, new route groups
- **Existing data preserved:** All existing leads, clients, invoices, and settings remain untouched

### Business Constraints
- **Single admin user:** Rafael is the only admin (multi-admin support is out of scope)
- **AI orchestration is conceptual:** The platform tracks project phases and statuses. Actual AI agent triggering is external to this platform (the Orchestrator + 7 Skills run in Claude Code sessions, not as automated API calls). The "Trigger Build" button changes status to track progress.
- **No real-time messaging:** Comments are async. No WebSocket/live chat between admin and client.
- **No payment processing:** Invoices are tracked, not collected online. Payment is external (bank transfer, Stripe link, etc.).

### Scope Boundaries
- **In scope:** Landing page, projects module, client portal, role-based access, navigation updates, dashboard extensions
- **Out of scope:** Multi-admin teams, real-time chat, online payments, automated AI agent API integration, mobile app, analytics/reporting exports

---

## 8. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Landing page loads in < 2s | LCP < 2s | Vercel Analytics |
| All existing CRM features still work | 0 regressions | Manual testing of leads, clients, invoices |
| Admin can create + track projects | End-to-end flow works | Create project → update phases → mark complete |
| Client can view their project progress | End-to-end flow works | Client login → see projects → view phases → download deliverables |
| Role-based access enforced | Admin and client routes isolated | Client cannot access /dashboard, /leads, etc. |
| Build deploys without errors | 0 build failures | Vercel deployment succeeds |
| 171+ existing tests still pass | 0 regressions | vitest run |

---

## 9. Tech Feasibility Confirmation

| Requirement | Feasibility | Notes |
|-------------|------------|-------|
| Public landing page | ✅ | New (marketing) route group, static/SSG |
| Role-based access | ✅ | profiles.role column + middleware checks |
| Projects module | ✅ | New tables + server actions + UI (same patterns as existing modules) |
| Client portal | ✅ | New (portal) route group with role-restricted middleware |
| Phase tracking | ✅ | project_phases table with status enum |
| File uploads for deliverables | ✅ | Supabase Storage (already set up for logos) |
| Comments system | ✅ | project_comments table with simple insert/select |
| Dashboard extension | ✅ | Add project queries to existing getDashboardMetrics() |
| SEO for landing page | ✅ | Next.js metadata API + static generation |

---

## 10. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Landing page design doesn't convert | Medium | Medium | Use proven high-converting patterns; iterate post-launch |
| Role-based access has auth bypass | High | Low | Test middleware thoroughly; RLS policies as backup |
| Existing CRM breaks during extension | High | Low | Don't modify existing files unless necessary; additive changes only |
| Client portal too basic for clients | Medium | Medium | Start minimal; add features based on client feedback |
| Project phase tracking too manual | Low | Medium | Future: automated status updates when AI agents run |
