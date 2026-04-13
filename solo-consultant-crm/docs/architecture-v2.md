# AI Dev Squad — Architecture v2

> **Version:** 2.0
> **Date:** 2026-04-13
> **Scope:** Extend Solo Consultant CRM → AI Dev Squad Consulting Platform
> **Approach:** Additive — existing schema/code untouched, new tables + routes + components added

---

## 1. System Architecture Overview

### High-Level Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        BROWSER                                       │
│                                                                      │
│  (marketing)/*   (auth)/*    (dashboard)/*      (portal)/*           │
│  Public landing   Login/     Admin CRM +        Client project       │
│  page — no auth   Signup     Projects module    progress view        │
└──────────────┬───────┬───────────┬───────────────────┬───────────────┘
               │       │           │                   │
               ▼       ▼           ▼                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 16 APP ROUTER (Vercel)                    │
│                                                                      │
│  middleware.ts — role-based routing:                                  │
│    (marketing)/* → public, no auth check                             │
│    (auth)/* → redirect to /dashboard or /portal if logged in         │
│    (dashboard)/* → require auth + role=admin                         │
│    (portal)/* → require auth + role=client                           │
│    / → landing page (public, no redirect)                            │
│                                                                      │
│  Server Components → read data via Supabase server client            │
│  Server Actions → mutations with Zod validation + auth checks        │
│  API Routes → PDF generation, cron jobs                              │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                     │
│                                                                      │
│  PostgreSQL ──────── 10 tables (6 existing + 4 new)                  │
│  Auth ────────────── Email/password, cookie sessions                 │
│  Storage ─────────── Logo uploads + project deliverable files        │
│  RLS ────────────── All tables scoped per user; client portal uses   │
│                     client_id matching for project visibility         │
└──────────────────────────────────────────────────────────────────────┘
```

### Route Groups

| Route Group | Auth Required | Role Required | Purpose |
|-------------|--------------|---------------|---------|
| `(marketing)/*` | No | None | Public landing page |
| `(auth)/*` | No (redirects if auth'd) | None | Login, signup, forgot-password |
| `(dashboard)/*` | Yes | `admin` | Full CRM: leads, clients, invoices, projects, settings |
| `(portal)/*` | Yes | `client` | Client-facing project progress view |

### Auth Flow Changes

**Current:** Login → always redirect to `/dashboard`
**New:** Login → check `profiles.role`:
- `admin` → redirect to `/dashboard`
- `client` → redirect to `/portal`

**Root `/` route change:** Currently redirects to `/dashboard` or `/login`. New behavior: serve the marketing landing page (public, static/SSG). No redirect.

---

## 2. New Database Enums

### project_type
```sql
CREATE TYPE project_type AS ENUM (
  'website',
  'landing_page',
  'web_app',
  'mobile_app',
  'crm',
  'erp',
  'ecommerce',
  'internal_tool',
  'other'
);
```

### project_status
```sql
CREATE TYPE project_status AS ENUM (
  'draft',
  'approved',
  'in_progress',
  'review',
  'completed',
  'delivered',
  'cancelled'
);
```

### phase_status
```sql
CREATE TYPE phase_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'failed'
);
```

---

## 3. New Database Tables

### 3.1 projects

```sql
CREATE TABLE projects (
  id               uuid           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id        uuid           NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name             text           NOT NULL,
  description      text           NULL,
  project_type     project_type   NOT NULL DEFAULT 'website',
  status           project_status NOT NULL DEFAULT 'draft',
  estimated_value  numeric(12,2)  NULL CHECK (estimated_value >= 0),
  notes            text           NULL,
  invoice_id       uuid           NULL REFERENCES invoices(id) ON DELETE SET NULL,
  repository_url   text           NULL,
  live_url         text           NULL,
  started_at       timestamptz    NULL,
  completed_at     timestamptz    NULL,
  delivered_at     timestamptz    NULL,
  created_at       timestamptz    NOT NULL DEFAULT now(),
  updated_at       timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(user_id, client_id);
CREATE INDEX idx_projects_status ON projects(user_id, status);
CREATE INDEX idx_projects_created_at ON projects(user_id, created_at DESC);
```

### 3.2 project_phases

```sql
CREATE TABLE project_phases (
  id              uuid         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id      uuid         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number    integer      NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  phase_name      text         NOT NULL,
  status          phase_status NOT NULL DEFAULT 'pending',
  started_at      timestamptz  NULL,
  completed_at    timestamptz  NULL,
  notes           text         NULL,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now(),
  UNIQUE(project_id, phase_number)
);

CREATE INDEX idx_project_phases_project_id ON project_phases(project_id);
```

### 3.3 project_comments

```sql
CREATE TABLE project_comments (
  id                uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id        uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number      integer     NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           text        NOT NULL,
  is_client_visible boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_comments_project_id ON project_comments(project_id, phase_number);
CREATE INDEX idx_project_comments_created_at ON project_comments(project_id, created_at DESC);
```

### 3.4 project_deliverables

```sql
CREATE TABLE project_deliverables (
  id                uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id        uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number      integer     NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name         text        NOT NULL,
  file_url          text        NOT NULL,
  file_size         bigint      NULL,
  is_client_visible boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_deliverables_project_id ON project_deliverables(project_id, phase_number);
```

---

## 4. Schema Extensions to Existing Tables

### 4.1 Add role to profiles

```sql
ALTER TABLE profiles
  ADD COLUMN role text NOT NULL DEFAULT 'admin'
  CHECK (role IN ('admin', 'client'));
```

**Note:** Also add `client_user_id` to the `clients` table so we can link a client record to a portal user account:

```sql
ALTER TABLE clients
  ADD COLUMN portal_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX idx_clients_portal_user_id ON clients(portal_user_id) WHERE portal_user_id IS NOT NULL;
```

### 4.2 Extend activity_type enum

```sql
ALTER TYPE activity_type ADD VALUE 'project_created';
ALTER TYPE activity_type ADD VALUE 'project_started';
ALTER TYPE activity_type ADD VALUE 'project_phase_updated';
ALTER TYPE activity_type ADD VALUE 'project_completed';
ALTER TYPE activity_type ADD VALUE 'project_delivered';
ALTER TYPE activity_type ADD VALUE 'project_cancelled';
```

---

## 5. RLS Policies for New Tables

### 5.1 projects

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Admin: full CRUD on own projects
CREATE POLICY "Admin can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Client: read-only on projects linked to their client record
CREATE POLICY "Client can view their projects"
  ON projects FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE portal_user_id = auth.uid()
    )
  );
```

### 5.2 project_phases

```sql
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

-- Admin: via parent project ownership
CREATE POLICY "Admin can view project phases"
  ON project_phases FOR SELECT
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can create project phases"
  ON project_phases FOR INSERT
  WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can update project phases"
  ON project_phases FOR UPDATE
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Client: read-only via client linkage
CREATE POLICY "Client can view their project phases"
  ON project_phases FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );
```

### 5.3 project_comments

```sql
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Admin: full CRUD
CREATE POLICY "Admin can view project comments"
  ON project_comments FOR SELECT
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can create project comments"
  ON project_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can delete project comments"
  ON project_comments FOR DELETE
  USING (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Client: read-only, only client-visible comments
CREATE POLICY "Client can view visible comments"
  ON project_comments FOR SELECT
  USING (
    is_client_visible = true AND
    project_id IN (
      SELECT p.id FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );
```

### 5.4 project_deliverables

```sql
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

-- Admin: full CRUD
CREATE POLICY "Admin can view project deliverables"
  ON project_deliverables FOR SELECT
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can upload deliverables"
  ON project_deliverables FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can delete deliverables"
  ON project_deliverables FOR DELETE
  USING (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Client: read-only, only client-visible deliverables
CREATE POLICY "Client can view visible deliverables"
  ON project_deliverables FOR SELECT
  USING (
    is_client_visible = true AND
    project_id IN (
      SELECT p.id FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );
```

---

## 6. Storage Extension

### Deliverables bucket

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', false);

-- Admin can upload deliverables (folder structure: {user_id}/{project_id}/{phase_number}/)
CREATE POLICY "Admin can upload deliverables"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin can view deliverables"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin can delete deliverables"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Client access to deliverables is through signed URLs generated by server actions
-- (No direct storage policy for clients — server creates signed download URLs)
```

---

## 7. Triggers for New Tables

```sql
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_phases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### Auto-create 7 phases when a project is created

```sql
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS trigger AS $$
DECLARE
  phase_names text[] := ARRAY['Research', 'Planning', 'Design', 'Frontend', 'Backend', 'Testing', 'Deployment'];
  i integer;
BEGIN
  FOR i IN 1..7 LOOP
    INSERT INTO project_phases (project_id, phase_number, phase_name)
    VALUES (NEW.id, i, phase_names[i]);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();
```

---

## 8. TypeScript Types (New)

Add to `src/lib/types/index.ts`:

```typescript
// ─── New Enums ──────────────────────────────────────
export type ProjectType = 'website' | 'landing_page' | 'web_app' | 'mobile_app' | 'crm' | 'erp' | 'ecommerce' | 'internal_tool' | 'other';
export type ProjectStatus = 'draft' | 'approved' | 'in_progress' | 'review' | 'completed' | 'delivered' | 'cancelled';
export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type UserRole = 'admin' | 'client';

// Update existing types
// ActivityType — add new values
export type ActivityType =
  | 'lead_created' | 'lead_stage_changed' | 'lead_converted'
  | 'client_created' | 'client_updated' | 'client_archived'
  | 'invoice_created' | 'invoice_sent' | 'invoice_paid' | 'invoice_overdue'
  | 'project_created' | 'project_started' | 'project_phase_updated'
  | 'project_completed' | 'project_delivered' | 'project_cancelled';

export type EntityType = 'lead' | 'client' | 'invoice' | 'project';

// Profile — add role
export interface Profile {
  // ... existing fields ...
  role: UserRole;
}

// Client — add portal_user_id
export interface Client {
  // ... existing fields ...
  portal_user_id: string | null;
}

// ─── New Database Row Types ─────────────────────────
export interface Project {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  description: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  estimated_value: number | null;
  notes: string | null;
  invoice_id: string | null;
  repository_url: string | null;
  live_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectPhase {
  id: string;
  project_id: string;
  phase_number: number;
  phase_name: string;
  status: PhaseStatus;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  phase_number: number;
  user_id: string;
  content: string;
  is_client_visible: boolean;
  created_at: string;
}

export interface ProjectDeliverable {
  id: string;
  project_id: string;
  phase_number: number;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  is_client_visible: boolean;
  created_at: string;
}

// ─── Joined / Computed Types ────────────────────────
export interface ProjectWithClient extends Project {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company'>;
}

export interface ProjectWithDetails extends Project {
  client: Pick<Client, 'id' | 'name' | 'email' | 'company'>;
  phases: ProjectPhase[];
  comments: ProjectComment[];
  deliverables: ProjectDeliverable[];
}

// What client sees in portal (filtered view)
export interface PortalProject {
  id: string;
  name: string;
  description: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  started_at: string | null;
  completed_at: string | null;
  delivered_at: string | null;
  created_at: string;
  phases: ProjectPhase[];
  comments: ProjectComment[];       // only is_client_visible=true
  deliverables: ProjectDeliverable[]; // only is_client_visible=true
}

// ─── Form Input Types ───────────────────────────────
export interface CreateProjectInput {
  client_id: string;
  name: string;
  description?: string;
  project_type: ProjectType;
  estimated_value?: number;
  notes?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  project_type?: ProjectType;
  status?: ProjectStatus;
  estimated_value?: number;
  notes?: string;
  invoice_id?: string | null;
  repository_url?: string;
  live_url?: string;
}

export interface UpdatePhaseInput {
  status: PhaseStatus;
  notes?: string;
}

export interface CreateCommentInput {
  project_id: string;
  phase_number: number;
  content: string;
  is_client_visible?: boolean;
}

// ─── New Constants ──────────────────────────────────
export const PROJECT_TYPES: ProjectType[] = [
  'website', 'landing_page', 'web_app', 'mobile_app',
  'crm', 'erp', 'ecommerce', 'internal_tool', 'other'
];

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  website: 'Website',
  landing_page: 'Landing Page',
  web_app: 'Web App',
  mobile_app: 'Mobile App',
  crm: 'CRM',
  erp: 'ERP',
  ecommerce: 'E-Commerce',
  internal_tool: 'Internal Tool',
  other: 'Other',
};

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  approved: { label: 'Approved', color: 'text-blue-600', bg: 'bg-blue-50' },
  in_progress: { label: 'In Progress', color: 'text-violet-600', bg: 'bg-violet-50' },
  review: { label: 'In Review', color: 'text-amber-600', bg: 'bg-amber-50' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
  delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
};

export const PHASE_STATUS_CONFIG: Record<PhaseStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-slate-500', bg: 'bg-slate-100' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
  failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50' },
};

export const PHASE_NAMES = [
  'Research',
  'Planning',
  'Design',
  'Frontend',
  'Backend',
  'Testing',
  'Deployment',
] as const;

// Extend DashboardMetrics
export interface DashboardMetrics {
  // ... existing fields ...
  active_projects: number;
  completed_projects: number;
  in_progress_projects: number;
}
```

---

## 9. Zod Validation Schemas (New)

Add to `src/lib/validations/index.ts`:

```typescript
export const createProjectSchema = z.object({
  client_id: z.string().uuid('Select a client'),
  name: z.string().min(1, 'Project name is required').max(300),
  description: z.string().max(5000).optional().or(z.literal('')),
  project_type: z.enum([
    'website', 'landing_page', 'web_app', 'mobile_app',
    'crm', 'erp', 'ecommerce', 'internal_tool', 'other'
  ]),
  estimated_value: z.coerce.number().min(0, 'Value must be positive').optional(),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum([
    'draft', 'approved', 'in_progress', 'review',
    'completed', 'delivered', 'cancelled'
  ]).optional(),
  invoice_id: z.string().uuid().nullable().optional(),
  repository_url: z.string().url().optional().or(z.literal('')),
  live_url: z.string().url().optional().or(z.literal('')),
});

export const updatePhaseSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export const createCommentSchema = z.object({
  project_id: z.string().uuid(),
  phase_number: z.number().int().min(1).max(7),
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
  is_client_visible: z.boolean().optional().default(true),
});

export const submitQuoteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Valid email is required'),
  company: z.string().max(200).optional().or(z.literal('')),
  project_type: z.enum([
    'website', 'landing_page', 'web_app', 'mobile_app',
    'crm', 'erp', 'ecommerce', 'internal_tool', 'other'
  ]),
  description: z.string().min(10, 'Please describe your project').max(5000),
  budget: z.string().optional().or(z.literal('')),
});
```

---

## 10. Server Actions / API Contract

### 10.1 Project Actions (Admin) — `src/app/(dashboard)/projects/actions.ts`

```typescript
// Get all projects for admin user
'use server'
async function getProjects(status?: ProjectStatus): Promise<ProjectWithClient[]>
// Auth: require admin role
// Query: SELECT projects.*, clients.name, clients.email, clients.company
//        FROM projects JOIN clients ON projects.client_id = clients.id
//        WHERE projects.user_id = auth.uid()
//        AND (status filter if provided)
//        ORDER BY created_at DESC

async function getProjectById(id: string): Promise<ProjectWithDetails>
// Auth: require admin role
// Query: project + phases + comments + deliverables (4 queries)

async function createProject(input: CreateProjectInput): Promise<ActionResult<Project>>
// Auth: require admin role
// Validate with createProjectSchema
// Insert project → trigger auto-creates 7 phases
// Log activity: project_created

async function updateProject(id: string, input: UpdateProjectInput): Promise<ActionResult<Project>>
// Auth: require admin role
// Validate with updateProjectSchema
// Update project
// If status changed to 'completed', set completed_at = now()
// If status changed to 'delivered', set delivered_at = now()
// revalidatePath

async function deleteProject(id: string): Promise<ActionResult<void>>
// Auth: require admin role
// Only allow delete if status is 'draft' or 'cancelled'
// Cascade deletes phases, comments, deliverables

async function triggerBuild(id: string): Promise<ActionResult<Project>>
// Auth: require admin role
// Verify project status is 'approved'
// Set project status = 'in_progress', started_at = now()
// Set phase 1 (Research) status = 'in_progress', started_at = now()
// Log activity: project_started
// revalidatePath

async function updatePhaseStatus(
  projectId: string,
  phaseNumber: number,
  input: UpdatePhaseInput
): Promise<ActionResult<ProjectPhase>>
// Auth: require admin role
// Validate with updatePhaseSchema
// Update phase status
// If status = 'in_progress', set started_at = now()
// If status = 'completed', set completed_at = now()
// If all 7 phases completed, set project status = 'review'
// Log activity: project_phase_updated
// revalidatePath

async function addPhaseComment(input: CreateCommentInput): Promise<ActionResult<ProjectComment>>
// Auth: require admin role
// Validate with createCommentSchema
// Insert comment
// revalidatePath

async function deleteComment(commentId: string): Promise<ActionResult<void>>
// Auth: require admin role

async function uploadDeliverable(formData: FormData): Promise<ActionResult<ProjectDeliverable>>
// Auth: require admin role
// Extract: project_id, phase_number, file, is_client_visible from FormData
// Upload file to Supabase Storage (deliverables bucket)
// Insert record in project_deliverables
// revalidatePath

async function deleteDeliverable(id: string): Promise<ActionResult<void>>
// Auth: require admin role
// Delete from storage + delete record
```

### 10.2 Portal Actions (Client) — `src/app/(portal)/actions.ts`

```typescript
'use server'
async function getMyProjects(): Promise<PortalProject[]>
// Auth: require client role
// 1. Get client record via portal_user_id = auth.uid()
// 2. SELECT projects WHERE client_id = client.id
// 3. For each project: fetch phases, visible comments, visible deliverables
// Returns PortalProject[] (filtered view)

async function getMyProjectById(projectId: string): Promise<PortalProject>
// Auth: require client role
// Same as above but single project
// Verify project belongs to client's client record

async function getDeliverableDownloadUrl(deliverableId: string): Promise<ActionResult<string>>
// Auth: require client role
// Verify deliverable is client-visible and belongs to client's project
// Generate signed URL from Supabase Storage
```

### 10.3 Dashboard Extension — `src/app/(dashboard)/actions.ts`

Extend existing `getDashboardMetrics()` to include:
```typescript
// Add to existing query:
// - active_projects: count of projects WHERE status IN ('approved', 'in_progress', 'review')
// - completed_projects: count WHERE status IN ('completed', 'delivered')
// - in_progress_projects: count WHERE status = 'in_progress'
```

### 10.4 Landing Page Action — `src/app/(marketing)/actions.ts`

```typescript
'use server'
async function submitQuoteRequest(input: unknown): Promise<ActionResult<void>>
// NO auth required (public form)
// Validate with submitQuoteSchema
// Use service role client to insert into leads table:
//   user_id = ADMIN_USER_ID (from env var ADMIN_USER_ID or hardcoded)
//   name = input.name
//   email = input.email
//   company = input.company
//   source = 'website'
//   stage = 'lead'
//   estimated_value = null
//   notes = `Project Type: ${input.project_type}\nBudget: ${input.budget}\n\n${input.description}`
// Log activity: lead_created
```

---

## 11. Middleware Changes

Update `src/lib/supabase/middleware.ts`:

```typescript
export async function updateSession(request: NextRequest) {
  // ... existing Supabase client setup ...

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // ── Public routes — no auth check ──
  // Landing page at / is now public (marketing route group)
  // Marketing routes are public
  if (path === '/' || path.startsWith('/marketing')) {
    return supabaseResponse;
  }

  // ── Auth routes — redirect if already authenticated ──
  if (user && (path === '/login' || path === '/signup' || path === '/forgot-password')) {
    // Check role to determine redirect target
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.role === 'client' ? '/portal' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // ── Protected: Dashboard routes — require admin role ──
  const adminRoutes = ['/dashboard', '/leads', '/clients', '/invoices', '/settings', '/projects'];
  const isAdminRoute = adminRoutes.some(r => path.startsWith(r));

  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/portal';
      return NextResponse.redirect(url);
    }
  }

  // ── Protected: Portal routes — require client role ──
  if (path.startsWith('/portal')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'client') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
```

---

## 12. Complete New/Modified File Structure

```
── NEW FILES ──────────────────────────────────────────

src/app/(marketing)/
  layout.tsx                      # Marketing layout (no sidebar, different header/footer)
  page.tsx                        # Landing page — SEO metadata + all sections
  actions.ts                      # submitQuoteRequest server action

src/app/(dashboard)/projects/
  page.tsx                        # Projects list (Server Component)
  new/page.tsx                    # Create project form
  [id]/page.tsx                   # Project detail with phase tracker
  [id]/edit/page.tsx              # Edit project form
  actions.ts                      # All project server actions

src/app/(portal)/
  layout.tsx                      # Portal layout (simplified sidebar, portal header)
  portal/page.tsx                 # Client's project dashboard
  portal/projects/[id]/page.tsx   # Project progress detail view
  actions.ts                      # Portal server actions (getMyProjects, etc.)

src/components/marketing/
  hero.tsx                        # Hero section with CTA
  services-grid.tsx               # 8 service type cards
  how-it-works.tsx                # 7-phase process visual
  pricing-tiers.tsx               # 3 pricing tier cards
  testimonials.tsx                # Testimonial carousel/grid
  cta-section.tsx                 # Final CTA with quote form
  marketing-header.tsx            # Landing page header (logo, nav links, CTA button)
  marketing-footer.tsx            # Footer with links, copyright

src/components/projects/
  project-table.tsx               # Sortable/filterable table of projects
  project-form.tsx                # Create/edit project form
  project-detail.tsx              # Full project detail view
  phase-tracker.tsx               # 7-phase progress visualization
  phase-status-badge.tsx          # Phase status badge component
  phase-comments.tsx              # Comments list + add comment form
  phase-deliverables.tsx          # Deliverables list + upload
  trigger-build-button.tsx        # "Start Build" button with confirmation
  project-status-badge.tsx        # Project status badge

src/components/portal/
  portal-header.tsx               # Portal top header (AI Dev Squad branding + user menu)
  portal-sidebar.tsx              # Simplified sidebar (Projects, Help only)
  portal-project-card.tsx         # Project summary card for portal dashboard
  portal-phase-tracker.tsx        # Read-only phase progress tracker
  portal-phase-detail.tsx         # Phase with visible comments + deliverables
  portal-deliverables.tsx         # Download list for client-visible files

supabase/migrations/
  00010_add_role_to_profiles.sql
  00011_create_project_enums.sql
  00012_create_projects.sql
  00013_create_project_phases.sql
  00014_create_project_comments.sql
  00015_create_project_deliverables.sql
  00016_extend_activity_type.sql
  00017_create_project_rls.sql
  00018_create_project_triggers.sql
  00019_create_project_storage.sql
  00020_add_portal_user_to_clients.sql

── MODIFIED FILES ─────────────────────────────────────

middleware.ts                                    # No change (delegates to middleware helper)
src/lib/supabase/middleware.ts                   # Add role-based routing (Section 11)
src/lib/types/index.ts                           # Add all new types (Section 8)
src/lib/validations/index.ts                     # Add all new schemas (Section 9)
src/app/(dashboard)/actions.ts                   # Extend getDashboardMetrics with project counts
src/app/(dashboard)/layout.tsx                   # No change (sidebar already dynamic)
src/components/layout/sidebar.tsx                # Add "Projects" nav item
src/components/dashboard/metrics-cards.tsx        # Add project metric cards
src/app/page.tsx                                 # REMOVE — replaced by (marketing) route group
```

---

## 13. Migration Plan (Ordered SQL Files)

### 00010_add_role_to_profiles.sql
```sql
ALTER TABLE profiles
  ADD COLUMN role text NOT NULL DEFAULT 'admin'
  CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'client'));
```

### 00011_create_project_enums.sql
```sql
CREATE TYPE project_type AS ENUM (
  'website', 'landing_page', 'web_app', 'mobile_app',
  'crm', 'erp', 'ecommerce', 'internal_tool', 'other'
);

CREATE TYPE project_status AS ENUM (
  'draft', 'approved', 'in_progress', 'review',
  'completed', 'delivered', 'cancelled'
);

CREATE TYPE phase_status AS ENUM (
  'pending', 'in_progress', 'completed', 'failed'
);
```

### 00012_create_projects.sql
```sql
CREATE TABLE projects (
  id               uuid           NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id        uuid           NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  name             text           NOT NULL,
  description      text           NULL,
  project_type     project_type   NOT NULL DEFAULT 'website',
  status           project_status NOT NULL DEFAULT 'draft',
  estimated_value  numeric(12,2)  NULL CHECK (estimated_value >= 0),
  notes            text           NULL,
  invoice_id       uuid           NULL REFERENCES invoices(id) ON DELETE SET NULL,
  repository_url   text           NULL,
  live_url         text           NULL,
  started_at       timestamptz    NULL,
  completed_at     timestamptz    NULL,
  delivered_at     timestamptz    NULL,
  created_at       timestamptz    NOT NULL DEFAULT now(),
  updated_at       timestamptz    NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(user_id, client_id);
CREATE INDEX idx_projects_status ON projects(user_id, status);
CREATE INDEX idx_projects_created_at ON projects(user_id, created_at DESC);
```

### 00013_create_project_phases.sql
```sql
CREATE TABLE project_phases (
  id              uuid         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id      uuid         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number    integer      NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  phase_name      text         NOT NULL,
  status          phase_status NOT NULL DEFAULT 'pending',
  started_at      timestamptz  NULL,
  completed_at    timestamptz  NULL,
  notes           text         NULL,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now(),
  UNIQUE(project_id, phase_number)
);

CREATE INDEX idx_project_phases_project_id ON project_phases(project_id);
```

### 00014_create_project_comments.sql
```sql
CREATE TABLE project_comments (
  id                uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id        uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number      integer     NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           text        NOT NULL,
  is_client_visible boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_comments_project_id ON project_comments(project_id, phase_number);
CREATE INDEX idx_project_comments_created_at ON project_comments(project_id, created_at DESC);
```

### 00015_create_project_deliverables.sql
```sql
CREATE TABLE project_deliverables (
  id                uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id        uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number      integer     NOT NULL CHECK (phase_number >= 1 AND phase_number <= 7),
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name         text        NOT NULL,
  file_url          text        NOT NULL,
  file_size         bigint      NULL,
  is_client_visible boolean     NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_deliverables_project_id ON project_deliverables(project_id, phase_number);
```

### 00016_extend_activity_type.sql
```sql
ALTER TYPE activity_type ADD VALUE 'project_created';
ALTER TYPE activity_type ADD VALUE 'project_started';
ALTER TYPE activity_type ADD VALUE 'project_phase_updated';
ALTER TYPE activity_type ADD VALUE 'project_completed';
ALTER TYPE activity_type ADD VALUE 'project_delivered';
ALTER TYPE activity_type ADD VALUE 'project_cancelled';
```

### 00017_create_project_rls.sql
```sql
-- ═══ PROJECTS ═══
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view own projects"
  ON projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can create projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update own projects"
  ON projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can delete own projects"
  ON projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Client can view their projects"
  ON projects FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE portal_user_id = auth.uid())
  );

-- ═══ PROJECT PHASES ═══
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project phases"
  ON project_phases FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can create project phases"
  ON project_phases FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can update project phases"
  ON project_phases FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Client can view their project phases"
  ON project_phases FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );

-- ═══ PROJECT COMMENTS ═══
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project comments"
  ON project_comments FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can create project comments"
  ON project_comments FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can delete project comments"
  ON project_comments FOR DELETE USING (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Client can view visible comments"
  ON project_comments FOR SELECT USING (
    is_client_visible = true AND
    project_id IN (
      SELECT p.id FROM projects p JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );

-- ═══ PROJECT DELIVERABLES ═══
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view project deliverables"
  ON project_deliverables FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can upload deliverables"
  ON project_deliverables FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Admin can delete deliverables"
  ON project_deliverables FOR DELETE USING (
    auth.uid() = user_id AND
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Client can view visible deliverables"
  ON project_deliverables FOR SELECT USING (
    is_client_visible = true AND
    project_id IN (
      SELECT p.id FROM projects p JOIN clients c ON c.id = p.client_id
      WHERE c.portal_user_id = auth.uid()
    )
  );
```

### 00018_create_project_triggers.sql
```sql
CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON project_phases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create 7 phases when a project is inserted
CREATE OR REPLACE FUNCTION public.handle_new_project()
RETURNS trigger AS $$
DECLARE
  phase_names text[] := ARRAY['Research', 'Planning', 'Design', 'Frontend', 'Backend', 'Testing', 'Deployment'];
  i integer;
BEGIN
  FOR i IN 1..7 LOOP
    INSERT INTO project_phases (project_id, phase_number, phase_name)
    VALUES (NEW.id, i, phase_names[i]);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_project();
```

### 00019_create_project_storage.sql
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('deliverables', 'deliverables', false);

CREATE POLICY "Admin can upload project deliverables"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin can view project deliverables"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admin can delete project deliverables"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'deliverables' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 00020_add_portal_user_to_clients.sql
```sql
ALTER TABLE clients
  ADD COLUMN portal_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX idx_clients_portal_user_id
  ON clients(portal_user_id) WHERE portal_user_id IS NOT NULL;
```

---

## 14. Environment Variable Additions

```env
# Admin user ID for public quote form (inserts leads under this user)
ADMIN_USER_ID=<rafael's auth.users UUID>
```

---

## 15. Project Milestones

### Milestone 1: Database + Auth Extensions
- Run all 11 migrations (00010–00020)
- Update TypeScript types and Zod schemas
- Update middleware for role-based routing
- **Deps:** None

### Milestone 2: AI Projects Module (Admin)
- Projects CRUD server actions
- Phase management server actions
- Comments + deliverables server actions
- Projects table page, create/edit forms, detail page with phase tracker
- Update sidebar navigation
- **Deps:** Milestone 1

### Milestone 3: Public Landing Page
- Marketing layout + all section components
- Quote submission form + server action
- SEO metadata
- **Deps:** Milestone 1 (for quote → lead creation)

### Milestone 4: Client Portal
- Portal layout + components
- Portal server actions
- Portal project list + detail pages
- **Deps:** Milestones 1, 2

### Milestone 5: Dashboard Extension + Polish
- Add project metrics to dashboard
- Cross-module integration testing
- **Deps:** Milestones 2, 3, 4
