# Solo Consultant CRM - Deployment Runbook

Complete step-by-step guide to deploy the Solo Consultant CRM from scratch. Follow each section in order.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#1-supabase-setup)
3. [Resend Setup](#2-resend-setup)
4. [Vercel Deployment](#3-vercel-deployment)
5. [Post-Deployment Checklist](#4-post-deployment-checklist)
6. [Monitoring Recommendations](#5-monitoring-recommendations)
7. [Maintenance](#6-maintenance)
8. [Docker Self-Hosted Alternative](#7-docker-self-hosted-alternative)
9. [Troubleshooting](#8-troubleshooting)

---

## Prerequisites

- A GitHub account with the repository pushed
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (free tier works)
- A [Resend](https://resend.com) account (free tier: 100 emails/day)
- Node.js 20+ and npm installed locally (for testing)

---

## 1. Supabase Setup

### 1.1 Create a New Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Choose your organization (or create one)
4. Fill in:
   - **Project name**: `solo-consultant-crm`
   - **Database password**: Generate a strong password and save it securely
   - **Region**: Choose the region closest to your users (e.g., `US East (N. Virginia)` matches the Vercel `iad1` region)
5. Click **Create new project** and wait for provisioning (~2 minutes)

### 1.2 Get API Keys

1. In your Supabase project, go to **Settings > API**
2. Copy these three values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`) -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public) key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role (secret) key** -> `SUPABASE_SERVICE_ROLE_KEY`

> **Warning**: The `service_role` key bypasses Row Level Security. Never expose it in client-side code.

### 1.3 Run Database Migrations

You have two options:

#### Option A: Supabase CLI (recommended)

```bash
# Install the Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (find your project ref in Settings > General)
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

#### Option B: SQL Editor (manual)

Run each migration file **in order** via the Supabase Dashboard SQL Editor (**SQL Editor > New query**):

1. `supabase/migrations/00001_create_enums.sql` - Creates enum types (lead_stage, lead_source, invoice_status, activity_type)
2. `supabase/migrations/00002_create_profiles.sql` - Creates profiles table + auto-profile trigger
3. `supabase/migrations/00003_create_leads.sql` - Creates leads table with indexes
4. `supabase/migrations/00004_create_clients.sql` - Creates clients table + FK from leads
5. `supabase/migrations/00005_create_invoices.sql` - Creates invoices and invoice_items tables
6. `supabase/migrations/00006_create_activity_log.sql` - Creates activity_log table
7. `supabase/migrations/00007_create_rls_policies.sql` - Enables RLS and creates all policies
8. `supabase/migrations/00008_create_storage.sql` - Creates avatars storage bucket + policies
9. `supabase/migrations/00009_create_triggers.sql` - Creates updated_at triggers

> **Important**: Run these in order. Migration 4 depends on 3, migration 5 depends on 4, etc.

### 1.4 Verify Setup

After running migrations, confirm in the Supabase Dashboard:

1. **Table Editor**: You should see 6 tables: `profiles`, `leads`, `clients`, `invoices`, `invoice_items`, `activity_log`
2. **Authentication > Providers**: Ensure **Email** provider is enabled (it is by default)
3. **Storage**: You should see an `avatars` bucket listed

Check RLS is active:

1. Go to **Table Editor**
2. Click on each table
3. Look for the **RLS Enabled** badge in the header - it should show on every table

### 1.5 Configure Auth Settings

1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to your production URL (e.g., `https://your-app.vercel.app`)
3. Add **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
4. Go to **Authentication > Providers**
5. Ensure **Email** is enabled with:
   - **Confirm email**: Enabled (recommended for production) or Disabled (easier for testing)
   - **Secure email change**: Enabled

### 1.6 Storage Configuration

The `avatars` bucket was created by migration 00008. Verify:

1. Go to **Storage** in the dashboard
2. You should see the `avatars` bucket listed as **Public**
3. RLS policies should be active (users can only manage their own folder)

---

## 2. Resend Setup

### 2.1 Create Account & API Key

1. Go to [https://resend.com](https://resend.com) and sign up
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
   - **Name**: `solo-consultant-crm`
   - **Permission**: `Sending access`
   - **Domain**: All domains (or restrict to your verified domain)
4. Copy the API key (starts with `re_`) -> `RESEND_API_KEY`

### 2.2 Domain Setup (Production)

For development, Resend provides a test domain (`onboarding@resend.dev`).

For production email sending:

1. Go to **Domains** in the Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `mail.yourdomain.com`)
4. Add the DNS records Resend provides (MX, TXT for SPF, DKIM)
5. Wait for verification (usually < 1 hour)
6. Update your email sending code to use your verified domain

---

## 3. Vercel Deployment

### 3.1 Connect Repository

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `solo-consultant-crm` repository
4. Vercel auto-detects **Next.js** as the framework

### 3.2 Configure Build Settings

Vercel will read `vercel.json` automatically. Verify:

- **Framework Preset**: Next.js
- **Build Command**: `next build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 3.3 Add Environment Variables

In the Vercel project settings, add these environment variables for **Production**, **Preview**, and **Development**:

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-ref.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | All |
| `RESEND_API_KEY` | `re_your_key` | All |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |

> **Tip**: For preview deployments, `NEXT_PUBLIC_APP_URL` can use the `VERCEL_URL` system variable.

### 3.4 Deploy

1. Click **Deploy**
2. Wait for the build to complete (typically 1-3 minutes)
3. Vercel will provide a deployment URL (e.g., `https://solo-consultant-crm.vercel.app`)

### 3.5 Custom Domain (optional)

1. Go to **Settings > Domains** in your Vercel project
2. Click **Add Domain**
3. Enter your domain (e.g., `crm.yourdomain.com`)
4. Add the DNS records Vercel provides (A record or CNAME)
5. Wait for DNS propagation and SSL certificate provisioning
6. Update `NEXT_PUBLIC_APP_URL` to your custom domain
7. Update Supabase auth redirect URLs to include the new domain

### 3.6 Enable Analytics (optional)

1. In your Vercel project, go to **Analytics**
2. Click **Enable** to activate Web Analytics (Core Web Vitals)
3. Go to **Speed Insights** and click **Enable** for real-user monitoring

### 3.7 Configure GitHub Actions for Preview Deploys

To enable the `deploy-preview.yml` workflow:

1. In Vercel, go to **Settings > General** and note your:
   - **Team ID** (or personal account ID) from the URL
   - **Project ID** from project settings
2. Go to Vercel **Account Settings > Tokens** and create a token
3. In GitHub, go to **Repository > Settings > Secrets and variables > Actions**
4. Add these repository secrets:
   - `VERCEL_TOKEN`: Your Vercel access token
   - `VERCEL_ORG_ID`: Your Vercel team/org ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

---

## 4. Post-Deployment Checklist

Run through this checklist after every production deployment:

### Authentication
- [ ] Navigate to `/signup` - create a new test account
- [ ] Check email confirmation (if enabled)
- [ ] Navigate to `/login` - sign in with the test account
- [ ] Verify redirect to `/dashboard`
- [ ] Test logout from the header dropdown
- [ ] Navigate to `/forgot-password` - verify reset email sends

### Dashboard
- [ ] Dashboard loads at `/dashboard` with empty state
- [ ] Metrics cards display (0 values for new account)
- [ ] Activity feed displays empty state

### Leads
- [ ] Navigate to `/leads`
- [ ] Create a new lead via the form
- [ ] Verify lead appears in pipeline board
- [ ] Drag lead between pipeline columns
- [ ] Click into lead detail page
- [ ] Convert a lead to a client

### Clients
- [ ] Navigate to `/clients`
- [ ] Create a new client
- [ ] Verify client appears in table
- [ ] Click into client detail page
- [ ] Edit client information
- [ ] Archive a client

### Invoices
- [ ] Navigate to `/invoices`
- [ ] Create a new invoice with line items
- [ ] Verify totals calculate correctly (subtotal, tax, total)
- [ ] Download invoice as PDF
- [ ] Send invoice via email (check recipient inbox)
- [ ] Mark invoice as paid

### Settings
- [ ] Navigate to `/settings`
- [ ] Update business profile (name, email, phone)
- [ ] Upload a business logo
- [ ] Change invoice prefix and default tax rate
- [ ] Save settings and verify they persist

### UI / UX
- [ ] Toggle dark mode - verify all pages render correctly
- [ ] Test on mobile viewport (responsive sidebar collapses)
- [ ] Check all navigation links work
- [ ] Verify no console errors in browser DevTools

### Security
- [ ] Verify RLS: sign up as a second user, confirm they cannot see first user's data
- [ ] Verify unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Check response headers include security headers (X-Frame-Options, etc.)

---

## 5. Monitoring Recommendations

### 5.1 Vercel Analytics (included)

Already enabled in step 3.6. Monitors:
- Core Web Vitals (LCP, FID, CLS, TTFB)
- Page-level performance data
- Real-user metrics

### 5.2 Sentry for Error Tracking

Install and configure Sentry for production error monitoring:

```bash
npx @sentry/wizard@latest -i nextjs
```

Or manually:

```bash
npm install @sentry/nextjs
```

Create `sentry.client.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://your-dsn@o123.ingest.sentry.io/456",
  tracesSampleRate: 0.1,       // 10% of transactions
  replaysSessionSampleRate: 0,  // No session replays in free tier
  replaysOnErrorSampleRate: 1.0, // Capture replay on error
});
```

Create `sentry.server.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://your-dsn@o123.ingest.sentry.io/456",
  tracesSampleRate: 0.1,
});
```

Add to `next.config.ts`:

```ts
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  // your existing config
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "solo-consultant-crm",
});
```

### 5.3 Supabase Dashboard Monitoring

Supabase provides built-in monitoring at no extra cost:

1. **Database > Reports**: Query performance, active connections, cache hit ratio
2. **Authentication > Users**: Monitor signups, active sessions
3. **Storage > Usage**: Track storage consumption
4. **Settings > Billing**: Monitor usage against free tier limits

Key limits to watch (free tier):
- Database: 500 MB
- Storage: 1 GB
- Auth: 50,000 monthly active users
- Edge Functions: 500,000 invocations/month

### 5.4 Uptime Monitoring

Set up a free uptime monitor:

**Option A: UptimeRobot (free tier: 50 monitors)**
1. Go to [https://uptimerobot.com](https://uptimerobot.com)
2. Add a new HTTP(s) monitor
3. URL: `https://your-app.vercel.app`
4. Monitoring interval: 5 minutes
5. Set up alert contacts (email, Slack, etc.)

**Option B: Better Uptime**
1. Go to [https://betteruptime.com](https://betteruptime.com)
2. Add your production URL as a monitor
3. Configure alerting policy

### 5.5 Log Drain (optional)

For production debugging, set up a Vercel log drain:

1. Go to Vercel **Project Settings > Log Drains**
2. Choose a provider:
   - **Datadog**: Full-featured APM
   - **Axiom**: Free tier with 500 GB/month ingest (recommended for small projects)
   - **Logtail** (now Better Stack): Free tier available
3. Follow the provider's integration guide

---

## 6. Maintenance

### 6.1 Running New Migrations

When you add new migration files:

#### Using Supabase CLI

```bash
# Create a new migration
supabase migration new my_migration_name

# Edit the generated file in supabase/migrations/

# Push to remote database
supabase db push
```

#### Manually via SQL Editor

1. Open Supabase Dashboard > SQL Editor
2. Paste and run the new migration SQL
3. Verify changes in Table Editor

### 6.2 Rolling Back Migrations

Supabase CLI does not have a built-in rollback. Options:

1. **Write a reverse migration**: Create a new migration that undoes the changes
   ```sql
   -- Example: revert adding a column
   ALTER TABLE leads DROP COLUMN IF EXISTS priority;
   ```
2. **Point-in-time recovery** (Pro plan): Restore database to a specific timestamp
   - Go to **Settings > Database > Backups**
   - Select a point-in-time to restore

### 6.3 Updating Dependencies

Follow this safe update process:

```bash
# 1. Check for outdated packages
npm outdated

# 2. Update patch/minor versions (safe)
npm update

# 3. For major version updates, update one at a time
npm install package-name@latest

# 4. Run the full test suite after each update
npm run lint
npx tsc --noEmit
npm test

# 5. Test the build
npm run build

# 6. Test locally before deploying
npm run dev
```

**Critical packages to update carefully** (may have breaking changes):
- `next` - Read the Next.js upgrade guide for each major version
- `@supabase/supabase-js` - Check Supabase changelog
- `react` / `react-dom` - Follow React upgrade guides
- `zod` - Schema validation changes can break forms

### 6.4 Backup Strategy

#### Database Backups

- **Free tier**: Supabase provides daily backups with 7-day retention
- **Pro tier**: Point-in-time recovery (PITR) down to the second

For additional safety:

```bash
# Export schema and data using Supabase CLI
supabase db dump -f backup.sql

# Export data only
supabase db dump -f data_backup.sql --data-only
```

Store backups in a secure location (encrypted cloud storage, not in the git repo).

#### Storage Backups

Supabase Storage (avatars bucket) is not automatically backed up. For critical files:

```bash
# Use the Supabase JS client or REST API to list and download files
# Or use the S3-compatible API with tools like rclone
```

### 6.5 Environment Variable Rotation

Periodically rotate sensitive keys:

1. **Supabase anon key**: Cannot be rotated without creating a new project. Protect via RLS.
2. **Supabase service role key**: Same as above. Keep it strictly server-side.
3. **Resend API key**: Rotate via Resend dashboard. Create new key -> update Vercel env vars -> delete old key.
4. After updating any env var in Vercel, trigger a redeployment.

---

## 7. Docker Self-Hosted Alternative

For self-hosted deployments (VPS, on-premise, etc.):

### 7.1 Prerequisites

- Docker 20+ and Docker Compose v2
- A server with at least 512 MB RAM
- Your Supabase project (cloud-hosted, or self-hosted Supabase)

### 7.2 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-user/solo-consultant-crm.git
cd solo-consultant-crm

# Create your environment file
cp .env.local.example .env.local
# Edit .env.local with your actual values

# Build and start
docker compose up --build -d

# Check the app is running
curl http://localhost:3000
```

### 7.3 Next.js Standalone Output

The Dockerfile uses Next.js standalone output mode. You need to enable it in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

This creates a minimal production bundle that includes only the files needed to run.

### 7.4 Updating the Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up --build -d

# Check logs
docker compose logs -f app
```

### 7.5 Reverse Proxy (Nginx)

For production with a custom domain and SSL:

```nginx
server {
    listen 80;
    server_name crm.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/crm.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 8. Troubleshooting

### Build fails on Vercel

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Missing environment variable" | Env vars not set | Add all vars in Vercel project settings |
| TypeScript errors | Type mismatch | Run `npx tsc --noEmit` locally to debug |
| Out of memory | Large dependencies | Add `NODE_OPTIONS=--max-old-space-size=4096` env var |

### Auth issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Invalid redirect URL" | Supabase auth misconfigured | Add your domain to Supabase > Auth > URL Configuration |
| Can't sign up | Email provider disabled | Enable Email in Supabase > Auth > Providers |
| Infinite redirect loop | Middleware issue | Check that `/auth/callback` route exists and handles tokens |

### Data not showing

| Symptom | Cause | Fix |
|---------|-------|-----|
| Empty tables after login | RLS blocking queries | Verify user_id matches auth.uid() in your inserts |
| "permission denied for table" | RLS policies missing | Re-run migration 00007 |
| Storage upload fails | Storage policies missing | Re-run migration 00008 |

### Email not sending

| Symptom | Cause | Fix |
|---------|-------|-----|
| 403 from Resend | Invalid API key | Check `RESEND_API_KEY` in env vars |
| Email not received | Wrong sender domain | Use verified domain or `onboarding@resend.dev` for testing |
| Rate limited | Free tier limit hit | Upgrade Resend plan or reduce sending |

---

## Quick Reference: All Environment Variables

| Variable | Required | Public | Description |
|----------|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | No | Supabase service role key (server-only) |
| `RESEND_API_KEY` | Yes | No | Resend API key for sending emails |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Public URL of the deployed app |
