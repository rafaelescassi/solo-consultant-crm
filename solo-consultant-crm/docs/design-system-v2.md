# AI Dev Squad — Design System Extension v2

> **Version:** 2.0
> **Date:** 2026-04-13
> **Scope:** Design specs for NEW modules only — Landing Page, AI Projects, Client Portal
> **Extends:** Existing CRM design system (globals.css, shadcn/ui components)

---

## 1. Brand Refresh

### Name Change
- Replace **"ConsultCRM"** with **"AI Dev Squad"** everywhere:
  - Sidebar logo (`src/components/layout/sidebar.tsx` line 23)
  - Auth page headings
  - Browser tab title (`<title>`)
  - Mobile nav header

### Logo Treatment
```
⚡ AI Dev Squad
```
- "⚡" icon in primary color, sized 20×20
- "AI Dev Squad" in Inter Bold 600, text-lg (18px)
- Alternatively use `Zap` icon from lucide-react for the bolt

### New CSS Custom Properties

Add to `:root` in globals.css:

```css
:root {
  /* existing vars unchanged ... */

  /* ── NEW: Marketing gradient ── */
  --gradient-hero: linear-gradient(135deg, hsl(221 83% 53%) 0%, hsl(262 83% 58%) 100%);
  --gradient-hero-hover: linear-gradient(135deg, hsl(221 83% 48%) 0%, hsl(262 83% 53%) 100%);

  /* ── NEW: Violet accent (for landing page + projects) ── */
  --violet: hsl(262 83% 58%);
  --violet-light: hsl(262 83% 95%);
}

.dark {
  /* existing dark vars unchanged ... */

  --gradient-hero: linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(262 83% 68%) 100%);
  --gradient-hero-hover: linear-gradient(135deg, hsl(217 91% 55%) 0%, hsl(262 83% 63%) 100%);
  --violet: hsl(262 83% 68%);
  --violet-light: hsl(262 60% 20%);
}
```

Also add to `@theme inline`:
```css
--color-violet: var(--violet);
--color-violet-light: var(--violet-light);
```

---

## 2. Marketing Landing Page Components

### 2.1 marketing-header.tsx

**File:** `src/components/marketing/marketing-header.tsx`
**Type:** Client Component (`'use client'` — needs scroll detection + mobile sheet)

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│  ⚡ AI Dev Squad    Services How It Works Pricing   [Get a Quote]  │
└────────────────────────────────────────────────────────┘
```

**Behavior:**
- `position: sticky; top: 0; z-index: 50;`
- **On hero (scrollY < 80):** `bg-transparent`, text-white, no border, no shadow
- **After scroll (scrollY >= 80):** `bg-background/95 backdrop-blur-md`, text-foreground, `border-b border-border`, `shadow-sm`
- Transition: `transition-all duration-300`

**Desktop (≥1280px):**
- Logo left: `⚡ AI Dev Squad` in Inter Bold, text-lg
- Nav center: `Services`, `How It Works`, `Pricing`, `Testimonials` — smooth-scroll anchor links
- CTA right: "Get a Quote" button — `variant="default"` when solid bg, white bg with primary text when over hero

**Mobile (<1280px):**
- Logo left, hamburger right (Menu icon from lucide)
- Sheet slides from right with nav links stacked vertically + CTA button at bottom
- Each link closes the sheet on click

**Nav link styles:**
- Desktop: `text-sm font-medium`, hover underline offset-4
- On hero: `text-white/80 hover:text-white`
- After scroll: `text-muted-foreground hover:text-foreground`

**Spacing:** `h-16 px-6` (same as dashboard header)
**Max content width:** `max-w-7xl mx-auto`

---

### 2.2 hero.tsx

**File:** `src/components/marketing/hero.tsx`
**Type:** Server Component (static content)

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│                     GRADIENT BACKGROUND                          │
│                  (blue-600 → violet-600, 135deg)                 │
│                                                                  │
│          Websites, Apps, CRMs & ERPs                             │
│          — Built by AI in Days                                   │
│                                                                  │
│   Your AI development team, on demand. White-glove consulting    │
│         with a 7-phase delivery process.                         │
│                                                                  │
│     [ Get a Free Quote ]    [ See How It Works ↓ ]               │
│                                                                  │
│  ┌─────────────┬─────────────┬──────────────────┐               │
│  │ 50+ Projects│ 7 Phases    │ Days, Not Months │               │
│  └─────────────┴─────────────┴──────────────────┘               │
└──────────────────────────────────────────────────────────────────┘
```

**Background:**
- `background: var(--gradient-hero);`
- Full viewport height: `min-h-screen`
- Subtle dot pattern overlay: CSS `radial-gradient` dots at 10% opacity white

```css
.hero-pattern {
  background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

**Content (centered, max-w-4xl):**
- **Headline:** `text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight`
  - "Websites, Apps, CRMs & ERPs" on line 1
  - "— Built by AI in Days" on line 2
- **Subheading:** `text-lg md:text-xl text-white/80 mt-6 max-w-2xl mx-auto`
- **CTA buttons (flex gap-4, mt-10, centered):**
  - "Get a Free Quote" → `bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 rounded-xl text-lg shadow-lg`
  - "See How It Works ↓" → `border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl text-lg`

**Stats bar (bottom of hero, mt-16):**
- 3 items in a row, separated by `|` divider
- Each: bold number + label, text-white
- `flex items-center justify-center gap-8 md:gap-16`
- Stats: `50+` Projects Built | `7-Phase` Process | `Days,` Not Months

**Spacing:** `pt-32 pb-20 px-6 text-center`

---

### 2.3 services-grid.tsx

**File:** `src/components/marketing/services-grid.tsx`
**Type:** Server Component

**Section layout:**
- `py-24 px-6 bg-background`
- **Title:** "What We Build" — `text-3xl md:text-4xl font-bold text-center`
- **Subtitle:** "From simple landing pages to complex enterprise platforms" — `text-lg text-muted-foreground text-center mt-4 max-w-2xl mx-auto`

**Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-7xl mx-auto`

**Card spec (8 cards):**
- `bg-card border border-border rounded-xl p-6`
- Hover: `hover:shadow-lg hover:-translate-y-1 transition-all duration-200`
- Icon: 40×40, `text-primary`, wrapped in `w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center`
- Title: `text-lg font-semibold mt-4`
- Description: `text-sm text-muted-foreground mt-2 leading-relaxed`

**Services & Icons (lucide-react):**

| Service | Icon | Description |
|---------|------|-------------|
| Website | `Globe` | Custom marketing websites with modern design and SEO optimization |
| Landing Page | `MousePointerClick` | High-converting single-page sites built for lead generation |
| Web App | `AppWindow` | Full-featured web applications with auth, dashboards, and workflows |
| Mobile App | `Smartphone` | Cross-platform mobile apps for iOS and Android |
| CRM | `Users` | Customer relationship management systems tailored to your business |
| ERP | `Building2` | Enterprise resource planning platforms for operations at scale |
| E-Commerce | `ShoppingCart` | Online stores with payment processing, inventory, and fulfillment |
| Internal Tool | `Wrench` | Custom admin panels, dashboards, and automation tools |

---

### 2.4 how-it-works.tsx

**File:** `src/components/marketing/how-it-works.tsx`
**Type:** Server Component

**Section layout:**
- `py-24 px-6 bg-secondary/50`
- **Title:** "Our 7-Phase AI Process" — `text-3xl md:text-4xl font-bold text-center`
- **Subtitle:** "A proven methodology that delivers production-ready products" — `text-lg text-muted-foreground text-center mt-4`

**Desktop (≥768px) — Horizontal stepper:**
```
  ①───②───③───④───⑤───⑥───⑦
  Re   Pl   De   Fr   Ba   Te   Dp
```
- `flex items-start justify-between max-w-5xl mx-auto mt-16`
- Each step is a column, `flex flex-col items-center text-center w-32`

**Step anatomy:**
- **Circle:** `w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold`
  - Color: `bg-primary text-primary-foreground`
- **Connector line** between circles:
  - `h-0.5 bg-primary/20 flex-1` — stretches between circle centers
  - Use absolute positioning or flexbox with line segments
- **Icon** below circle: lucide icon, `w-5 h-5 text-primary mt-3`
- **Phase name:** `text-sm font-semibold mt-2`
- **Description:** `text-xs text-muted-foreground mt-1`

**Mobile (<768px) — Vertical stepper:**
- `flex flex-col gap-0` — each step stacked
- Circle left, content right (like a timeline)
- Vertical connector line: `w-0.5 bg-primary/20 h-8` between steps

**Phase data:**

| # | Name | Icon | Description |
|---|------|------|-------------|
| 1 | Research | `Search` | Market analysis, requirements gathering, competitor research |
| 2 | Planning | `Map` | Architecture design, tech stack, database schema, API contracts |
| 3 | Design | `Palette` | UI/UX wireframes, design system, component specifications |
| 4 | Frontend | `Monitor` | Responsive interfaces, state management, client-side logic |
| 5 | Backend | `Server` | APIs, databases, authentication, business logic |
| 6 | Testing | `TestTube` | Unit tests, integration tests, QA, security audits |
| 7 | Deployment | `Rocket` | CI/CD, hosting, monitoring, go-live |

---

### 2.5 pricing-tiers.tsx

**File:** `src/components/marketing/pricing-tiers.tsx`
**Type:** Server Component

**Section layout:**
- `py-24 px-6 bg-background`
- **Title:** "Simple, Transparent Pricing"
- **Subtitle:** "Choose the package that fits your project. No hidden fees."

**Grid:** `grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto`

**Card anatomy:**
- `bg-card border rounded-2xl p-8 flex flex-col`
- Professional tier: `border-primary border-2 relative` with "Most Popular" badge
  - Badge: `absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium`

**Per card:**
- **Tier name:** `text-xl font-semibold`
- **Price:** `text-4xl font-bold mt-4` + `text-lg text-muted-foreground` for range
- **Description:** `text-sm text-muted-foreground mt-2`
- **Divider:** `border-t border-border my-6`
- **Features list:** `space-y-3` — each: `Check` icon (green) + text `text-sm`
- **CTA button:** full-width at bottom
  - Starter: `variant="outline"`, "Get Started"
  - Professional: `variant="default"`, "Get Started" (primary filled)
  - Enterprise: `variant="outline"`, "Contact Us"

**Tier data:**

| Tier | Price | Description | Features |
|------|-------|-------------|----------|
| Starter | $2,500–$5,000 | Perfect for landing pages and simple websites | Landing pages, Marketing websites, Basic SEO, Mobile responsive, 1 revision round, 5-day delivery, Email support |
| Professional | $10,000–$25,000 | Full web apps, CRMs, and complex builds | Everything in Starter, Custom web applications, Database design, User authentication, API integrations, 3 revision rounds, 10-day delivery, Priority support |
| Enterprise | $25,000+ | Enterprise platforms and multi-system integrations | Everything in Professional, Enterprise platforms (ERP/CRM), Mobile apps, Advanced integrations, CI/CD pipeline, Monitoring & alerting, Unlimited revisions, Dedicated support, Post-launch retainer |

---

### 2.6 testimonials.tsx

**File:** `src/components/marketing/testimonials.tsx`
**Type:** Server Component

**Section layout:**
- `py-24 px-6 bg-secondary/50`
- **Title:** "What Our Clients Say"

**Grid:** `grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto`

**Card anatomy:**
- `bg-card border border-border rounded-xl p-6`
- **Quote:** `text-sm text-foreground leading-relaxed` — prefixed with large `"` in text-primary/20, text-4xl
- **Author row (mt-4, flex gap-3):**
  - Avatar circle: `w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm` — initials
  - Name: `text-sm font-semibold`
  - Company: `text-xs text-muted-foreground`
- **Star rating:** 5 `Star` icons from lucide, `w-4 h-4 text-amber-400 fill-amber-400`

**Placeholder testimonials:**

1. "AI Dev Squad built our entire CRM in under a week. The quality was indistinguishable from a months-long traditional build." — **Sarah Mitchell**, TechFlow Solutions
2. "The 7-phase process kept us informed every step of the way. We could see exactly what was happening with our project." — **James Rodriguez**, Pinnacle Consulting
3. "We needed a complex e-commerce platform fast. They delivered a production-ready app that handles thousands of orders daily." — **Emily Chen**, Urban Market Co.

---

### 2.7 cta-section.tsx

**File:** `src/components/marketing/cta-section.tsx`
**Type:** Client Component (`'use client'` — form handling)

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│                  GRADIENT BACKGROUND (same as hero)               │
│                                                                  │
│          Ready to Build Something Amazing?                        │
│    Tell us about your project and get a free quote within 24h    │
│                                                                  │
│    ┌──────────────────────────────────────────────┐              │
│    │  Name*        │  Email*                      │              │
│    │  Company      │  Project Type (select)*      │              │
│    │  Tell us about your project* (textarea)      │              │
│    │  Budget Range (select, optional)             │              │
│    │            [ Get a Free Quote → ]             │              │
│    └──────────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

**Background:** Same gradient as hero
**Content:** `max-w-3xl mx-auto text-center py-24 px-6`

**Heading:** `text-3xl md:text-4xl font-bold text-white`
**Subheading:** `text-lg text-white/80 mt-4`

**Form card:** `bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mt-10 text-left`

**Form grid:** `grid grid-cols-1 md:grid-cols-2 gap-4`
- Row 1: Name (text), Email (email)
- Row 2: Company (text, optional), Project Type (select)
- Row 3 (full width): Description (textarea, 4 rows)
- Row 4 (full width): Budget Range (select, optional)
- Row 5 (full width): Submit button

**Input styling (on gradient bg):**
- `bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/50`
- Labels: `text-white/80 text-sm font-medium`

**Select options for Project Type:**
Website, Landing Page, Web App, Mobile App, CRM, ERP, E-Commerce, Internal Tool, Other

**Select options for Budget Range:**
"$2,500 – $5,000", "$5,000 – $10,000", "$10,000 – $25,000", "$25,000 – $50,000", "$50,000+", "Not sure yet"

**Submit button:** `bg-white text-primary font-semibold w-full py-3 rounded-xl hover:bg-white/90 text-lg mt-2`

**Success state:** Replace form with:
- `CheckCircle` icon (white, w-16 h-16) centered
- "Thanks! We'll be in touch within 24 hours." — `text-xl font-semibold text-white mt-4`
- "Check your email for confirmation." — `text-white/80 mt-2`

**Error state:** Toast notification via sonner

---

### 2.8 marketing-footer.tsx

**File:** `src/components/marketing/marketing-footer.tsx`
**Type:** Server Component

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│  bg-neutral-900 text-neutral-300                                 │
│                                                                  │
│  ⚡ AI Dev Squad     Services       Company      Legal           │
│  Your AI dev team,   Websites       About        Privacy Policy  │
│  on demand.          Web Apps       Contact      Terms of Service│
│                      Mobile Apps                                 │
│                      CRMs & ERPs                                 │
│                                                                  │
│  ──────────────────────────────────────────────────              │
│  © 2026 AI Dev Squad. All rights reserved.   [gh] [li] [x]      │
└──────────────────────────────────────────────────────────────────┘
```

**Background:** `bg-neutral-900`
**Text:** `text-neutral-400` for body, `text-white` for headings
**Content:** `max-w-7xl mx-auto py-16 px-6`

**Top section:** `grid grid-cols-2 md:grid-cols-4 gap-8`

**Column 1 — Brand:**
- Logo: `⚡ AI Dev Squad` in white, text-lg font-bold
- Tagline: "Your AI development team, on demand." in `text-sm text-neutral-400 mt-3`

**Column 2 — Services:**
- Heading: `text-sm font-semibold text-white uppercase tracking-wider`
- Links: `text-sm text-neutral-400 hover:text-white transition-colors`
- Items: Websites, Web Apps, Mobile Apps, CRMs & ERPs

**Column 3 — Company:**
- Items: About (placeholder), Contact (mailto link)

**Column 4 — Legal:**
- Items: Privacy Policy (#), Terms of Service (#)

**Bottom bar:** `border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4`
- Left: `© 2026 AI Dev Squad. All rights reserved.` — `text-sm text-neutral-500`
- Right: Social icons (GitHub, LinkedIn, Twitter) — `text-neutral-400 hover:text-white w-5 h-5`

---

## 3. AI Projects Module Components

### 3.1 project-table.tsx

**File:** `src/components/projects/project-table.tsx`
**Type:** Client Component (search + filter tabs)

**Follows exact same pattern as `invoice-table.tsx`.**

**Top bar:**
- Search input with `Search` icon, debounced 300ms, `max-w-sm`
- Filter tabs: All, Draft, Approved, In Progress, Review, Completed, Delivered — each with count badge
- `+ New Project` button: `variant="default"`, `Plus` icon

**Table columns:**

| Column | Width | Content |
|--------|-------|---------|
| Project Name | flex-1 | `font-medium text-foreground` — clickable, navigates to detail |
| Client | 150px | Client name, `text-muted-foreground` |
| Type | 130px | `ProjectTypeBadge` — uses same badge pattern, violet bg |
| Status | 130px | `ProjectStatusBadge` |
| Est. Value | 120px | `CurrencyDisplay`, right-aligned |
| Created | 100px | `DateDisplay` short format |
| Actions | 50px | `DropdownMenu`: View, Edit, Cancel, Delete |

**Empty state:** `EmptyState` with `FolderKanban` icon, "No projects yet", "Create your first AI project", CTA to /projects/new

**Pagination:** Same pattern as client-table — 10 per page

---

### 3.2 project-form.tsx

**File:** `src/components/projects/project-form.tsx`
**Type:** Client Component (react-hook-form)

**Same card form pattern as `client-form.tsx`:**
- `Card` wrapper, `max-w-[600px] mx-auto`
- `CardHeader`: "New Project" or "Edit Project"
- `CardContent`: form fields

**Fields:**
1. **Name** — `Input`, required, placeholder "e.g. Acme Corp Website Redesign"
2. **Client** — `Select` from existing clients list (passed as prop), required
3. **Project Type** — `Select` with all 9 options from PROJECT_TYPE_LABELS, required
4. **Description** — `Textarea`, 4 rows, optional, placeholder "Describe the project scope..."
5. **Estimated Value** — `Input` type="number", `$` prefix adornment, optional
6. **Notes** — `Textarea`, 3 rows, optional, placeholder "Internal notes..."

**Footer buttons:**
- Cancel (ghost) + Save (default)
- Edit mode: also shows current status badge in header

**Validation:** Uses `createProjectSchema` with `@hookform/resolvers/zod`

---

### 3.3 project-detail.tsx

**File:** `src/components/projects/project-detail.tsx`
**Type:** Client Component (tabs interaction)

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│ ← Back to Projects                           [Edit] [Cancel] [▼]│
│                                                                  │
│ ┌────────────────────────────────────────────────────────┐       │
│ │ Acme Corp Website Redesign          [Web App] [In Progress]│  │
│ │ Client: John Smith (john@acme.com)                         │  │
│ │ Est. Value: $15,000    Started: Apr 10    Created: Apr 8   │  │
│ │ Repo: github.com/...    Live: acme.vercel.app              │  │
│ └────────────────────────────────────────────────────────┘       │
│                                                                  │
│ ┌─ Phase Tracker ──────────────────────────────────────────┐    │
│ │ ①──②──③──④──⑤──⑥──⑦                                      │    │
│ │ ✓  ✓  ●  ○  ○  ○  ○                                      │    │
│ └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│ [ Phases ] [ Comments ] [ Deliverables ] [ Settings ]            │
│                                                                  │
│ ┌─ Phase 3: Design ─── In Progress ──────────────────────┐      │
│ │ Status: [Select ▼]    Started: Apr 12                   │      │
│ │ Notes: Working on wireframes...                         │      │
│ │                                                         │      │
│ │ Comments (2):                                           │      │
│ │ • "Wireframes approved by client" — 2h ago [visible]    │      │
│ │ • "Using violet as accent" — 3h ago [internal]          │      │
│ │ [Add comment... ] [✓ Visible to client] [Post]          │      │
│ │                                                         │      │
│ │ Deliverables:                                           │      │
│ │ • wireframes-v2.pdf (1.2 MB) [visible] [⬇] [🗑]        │      │
│ │ [+ Upload File]                                         │      │
│ └─────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

**Header card:**
- `Card` with `p-6`
- Row 1: Project name (text-2xl font-bold) + Type badge + Status badge + Trigger Build button (if status = 'approved')
- Row 2: Client info (name, email — linked to client detail page)
- Row 3: `grid grid-cols-2 md:grid-cols-4 gap-4 mt-4` — Value, Started date, Created date, and links (repo, live URL)

**Tabs:** shadcn `Tabs` component — Phases, Comments, Deliverables, Settings

---

### 3.4 phase-tracker.tsx — KEY COMPONENT

**File:** `src/components/projects/phase-tracker.tsx`
**Type:** Client Component (clickable phases)

**Desktop (≥768px) — Horizontal:**
```
  ✓───✓───●───○───○───○───○
  Res  Pln  Des  Fro  Bac  Tes  Dep
```

**Container:** `flex items-center justify-between w-full py-6`

**Per step:**
- `flex flex-col items-center cursor-pointer group`
- Width: `w-20`

**Circle (w-10 h-10 rounded-full, flex items-center justify-center, font-semibold text-sm):**
- `pending`: `bg-muted text-muted-foreground border-2 border-border`
- `in_progress`: `bg-blue-500 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)] animate-pulse` (gentle pulse)
- `completed`: `bg-green-500 text-white` → show `Check` icon instead of number
- `failed`: `bg-red-500 text-white` → show `X` icon instead of number

**Connector line between circles:**
- `h-0.5 flex-1 mx-1`
- Between two completed: `bg-green-500`
- Between completed and in_progress: `bg-green-500` (left half) → gradient to blue
- Otherwise: `bg-border` (gray dashed via `border-t-2 border-dashed`)

**Phase name below circle:**
- `text-xs font-medium mt-2`
- Active (in_progress): `text-blue-600 font-semibold`
- Completed: `text-green-600`
- Pending: `text-muted-foreground`
- Failed: `text-red-600`

**Selected state:** When a phase is clicked:
- Circle gets `ring-2 ring-primary ring-offset-2`
- Expand detail panel below the tracker (via parent state)

**Mobile (<768px) — Vertical stepper:**
- `flex flex-col gap-0`
- Each step: circle left + content right (name + status)
- Vertical connector: `w-0.5 h-6 ml-5` between steps
- Same circle colors as desktop

**Accessibility:**
- `role="list"` on container
- `role="listitem"` on each step
- `aria-label="Phase {n}: {name} — {status}"` on each step
- `aria-current="step"` on the in_progress phase
- `tabIndex={0}` on each step for keyboard nav
- `onKeyDown` handler: Enter/Space to select

---

### 3.5 phase-status-badge.tsx

**File:** `src/components/projects/phase-status-badge.tsx`
**Type:** Server Component

**Identical pattern to `InvoiceStatusBadge`:**
```tsx
<span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', config.bg, config.color)}>
  <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
  {config.label}
</span>
```

**Dot colors:**
- pending: `bg-slate-400`
- in_progress: `bg-blue-500`
- completed: `bg-green-500`
- failed: `bg-red-500`

### 3.6 project-status-badge.tsx

Same pattern. Dot colors:
- draft: `bg-slate-400`
- approved: `bg-blue-500`
- in_progress: `bg-violet-500`
- review: `bg-amber-500`
- completed: `bg-green-500`
- delivered: `bg-emerald-500`
- cancelled: `bg-red-500`

---

### 3.7 phase-comments.tsx

**File:** `src/components/projects/phase-comments.tsx`
**Type:** Client Component (form handling)

**Comment list:**
- `space-y-4`
- Each comment:
  - `flex gap-3`
  - Avatar circle: `w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-xs flex items-center justify-center` — "A" for admin
  - Content column:
    - Row 1: `text-sm font-medium` name + `text-xs text-muted-foreground` relative timestamp
    - Row 2: `text-sm text-foreground mt-1` comment content
    - Row 3 (if internal): `text-xs text-muted-foreground italic flex items-center gap-1` → `Lock` icon + "Internal note"
  - Visibility indicator: if `is_client_visible=false`, show `EyeOff` icon muted

**Add comment form (mt-6, border-t pt-4):**
- `Textarea`, 3 rows, placeholder "Add a comment..."
- Row below textarea: `flex items-center justify-between`
  - Left: Checkbox + label "Visible to client" (default checked)
  - Right: "Post Comment" button, `variant="default"`, `size="sm"`

---

### 3.8 phase-deliverables.tsx

**File:** `src/components/projects/phase-deliverables.tsx`
**Type:** Client Component (file upload)

**File list:**
- `space-y-2`
- Each file: `flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50`
  - File icon: `FileText` for docs, `Image` for images, `File` for others — `w-8 h-8 text-muted-foreground`
  - Info column (flex-1):
    - `text-sm font-medium` file name
    - `text-xs text-muted-foreground` — file size + upload date
  - Visibility toggle: `Eye`/`EyeOff` icon button — toggles is_client_visible
  - Download: `Download` icon button
  - Delete: `Trash2` icon button (destructive color on hover)

**Upload area (mt-4):**
- Dashed border box: `border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer`
- `Upload` icon centered, `w-8 h-8 text-muted-foreground`
- "Click to upload or drag and drop"
- "PDF, DOC, PNG, JPG up to 50MB"
- Checkbox below: "Make visible to client" (default checked)

---

### 3.9 trigger-build-button.tsx

**File:** `src/components/projects/trigger-build-button.tsx`
**Type:** Client Component (dialog + loading state)

**Button:**
- `variant="default"` with `bg-green-600 hover:bg-green-700 text-white`
- `Rocket` icon + "Start Build"
- `size="lg"` `px-6`
- **Only visible** when project status = `approved`
- **Disabled** with tooltip when status ≠ approved

**Confirm dialog (ConfirmDialog):**
- Title: "Start AI Build?"
- Description: "This will begin the 7-phase AI development process. Phase 1 (Research) will start immediately."
- Confirm button: "Start Build" (green)
- Cancel button: "Cancel" (ghost)

**Loading state:** Button shows spinner + "Starting..." while server action executes

---

## 4. Client Portal Components

### 4.1 portal-header.tsx

**File:** `src/components/portal/portal-header.tsx`
**Type:** Client Component (user menu)

**Layout (same height as dashboard header: h-16):**
```
┌────────────────────────────────────────────────────────┐
│  ⚡ AI Dev Squad — Client Portal      John Smith [Sign Out] │
└────────────────────────────────────────────────────────┘
```

- Left: Logo + "Client Portal" label in `text-sm text-muted-foreground`
- Right: User name + `LogOut` icon button
- `bg-card border-b border-border`
- Mobile: hamburger for sidebar

---

### 4.2 portal-sidebar.tsx

**File:** `src/components/portal/portal-sidebar.tsx`
**Type:** Client Component (active state)

**Minimal sidebar (w-64, same styling as admin sidebar):**
- Logo: `⚡ AI Dev Squad`
- Nav items (only 2):
  - `FolderOpen` — "My Projects" → `/portal`
  - `HelpCircle` — "Help & Support" → `mailto:support@aidevsquad.com`
- Bottom: User info (email, role badge "Client")

**Same styling patterns as admin sidebar:** active bg-primary/10, text-primary

---

### 4.3 portal-project-card.tsx

**File:** `src/components/portal/portal-project-card.tsx`
**Type:** Server Component

**Card layout:**
```
┌────────────────────────────────────────────┐
│ Acme Corp Website          [Web App] [In Progress]
│                                            │
│ ● ● ● ◐ ○ ○ ○   3 of 7 phases complete   │
│                                            │
│ Started: Apr 10, 2026                      │
│                          View Progress →   │
└────────────────────────────────────────────┘
```

- `Card` with `p-6 hover:shadow-md transition-shadow cursor-pointer`
- Row 1: Project name (`text-lg font-semibold`) + type badge + status badge
- Row 2: Mini phase dots (7 small circles, colored by phase status) + progress text
- Row 3: Start date
- Row 4: "View Progress →" link aligned right
- Click entire card navigates to `/portal/projects/[id]`

**Mini phase dots:**
- `flex gap-1.5`
- Each dot: `w-3 h-3 rounded-full`
- pending: `bg-muted border border-border`
- in_progress: `bg-blue-500 animate-pulse`
- completed: `bg-green-500`
- failed: `bg-red-500`

---

### 4.4 portal-phase-tracker.tsx

**File:** `src/components/portal/portal-phase-tracker.tsx`
**Type:** Client Component (clickable for detail expansion)

**READ-ONLY version of admin phase-tracker.tsx:**
- Same visual design (circles, connectors, colors)
- No status dropdown/edit controls
- Click phase → show phase detail below
- Same responsive behavior (horizontal desktop, vertical mobile)

---

### 4.5 portal-phase-detail.tsx

**File:** `src/components/portal/portal-phase-detail.tsx`
**Type:** Server Component

**When a phase is selected:**
```
┌─ Phase 3: Design ──────── Completed ✓ ──────────────┐
│                                                       │
│ Comments:                                             │
│ • "Wireframes have been approved" — Apr 12, 2:30 PM   │
│ • "Design system finalized" — Apr 11, 10:15 AM        │
│                                                       │
│ Deliverables:                                         │
│ 📄 wireframes-v2.pdf (1.2 MB)        [Download ⬇]    │
│ 📄 design-tokens.json (24 KB)        [Download ⬇]    │
└───────────────────────────────────────────────────────┘
```

- `Card` with `p-6 mt-4`
- Phase name + status badge in header
- Dates: Started, Completed (if applicable)
- **Comments section:** Read-only list (same visual as admin but no form, no internal comments shown)
- **Deliverables section:** Download list only (no upload, no delete, no visibility toggle)

---

### 4.6 portal-deliverables.tsx

**File:** `src/components/portal/portal-deliverables.tsx`
**Type:** Server Component

**Simple download list:**
- Each file: `flex items-center gap-3 p-3 rounded-lg border border-border`
  - File icon (by type)
  - File name + size
  - Download button (primary color): `Download` icon + "Download"
- Empty state: "No deliverables yet for this phase."

---

## 5. Navigation Update

### Admin Sidebar Modification

**File:** `src/components/layout/sidebar.tsx`

**Add to navItems array (between Pipeline and Clients):**
```typescript
{ href: '/projects', label: 'Projects', icon: FolderKanban },
```

**Import:** `import { FolderKanban } from 'lucide-react';`

**Updated navItems:**
```typescript
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Pipeline', icon: Target },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/invoices', label: 'Invoices', icon: FileText },
];
```

Also update logo text from "ConsultCRM" to "AI Dev Squad":
```tsx
<Link href="/dashboard" className="text-lg font-semibold text-primary">
  ⚡ AI Dev Squad
</Link>
```

---

## 6. Accessibility Specifications

### 6.1 Landing Page
- **Heading hierarchy:** h1 in hero (only one), h2 for each section title, h3 for cards/items
- **Skip to content:** `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>` at top of layout
- **CTA form:** All inputs have associated `<label>`, error messages use `aria-describedby`
- **Nav links:** `aria-label="Main navigation"` on nav element
- **Color contrast:** All text on gradient backgrounds must meet 4.5:1 ratio — white on blue-600/violet-600 passes (verified)

### 6.2 Phase Tracker
- Overall container: `role="list"` with `aria-label="Project development phases"`
- Each step: `role="listitem"` with `aria-label="Phase {n}: {name} — Status: {status}"`
- Current phase: `aria-current="step"`
- Keyboard: Tab between steps, Enter/Space to select
- Screen reader: Status changes announced via `aria-live="polite"` region

### 6.3 Client Portal
- Portal header: `role="banner"`, nav: `role="navigation"`
- Project cards: `role="article"`, clickable area is a proper `<Link>`
- Download buttons: `aria-label="Download {filename}"`
- Phase progress: same as admin phase tracker accessibility

### 6.4 Forms
- All form fields: visible `<Label>` + `htmlFor` association
- Error messages: `<p id="field-error" role="alert">` + `aria-describedby="field-error"` on input
- Required fields: `aria-required="true"` + visual asterisk
- Submit buttons: descriptive text (not just "Submit")

### 6.5 Focus Management
- Same focus ring as existing: `outline-ring/50` (from globals.css base styles)
- Modal dialogs: focus trapped, returns focus on close
- Page navigation: focus moves to `<h1>` on route change

---

## 7. User Flows

### Flow 1: Visitor → Quote Request
```
Landing Page (/) → Scroll to CTA → Fill form → Submit
  → Success message → Lead created in admin's pipeline
```

### Flow 2: Admin — Lead → Client → Project → Deliver
```
Dashboard → Pipeline → Drag lead to "Won" → Convert to Client
  → Clients → Select client → New Project → Fill form → Save (draft)
  → Projects → [id] → Mark as "Approved"
  → Click "Start Build" → Phase 1 starts
  → Update phases as AI squad works
  → All 7 complete → Project → "Review" → "Completed" → "Delivered"
  → Create invoice for client
```

### Flow 3: Client Portal — View Progress
```
Login → /portal (projects list) → Click project
  → See 7-phase tracker → Click completed phase
  → Read comments → Download deliverables
```
