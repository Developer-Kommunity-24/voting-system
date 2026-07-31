# Voting System: Self-Deployment & Infrastructure Guide

This guide outlines the self-deployment process and key infrastructure setup for the **Voting System** application, covering both the frontend and backend. It includes instructions for setting up custom domains, Cloudflare D1 database, and Clerk authentication integration.

---

## 📋 Table of Contents

- [Assumptions & Prerequisites](#assumptions--prerequisites)
- [1. Overview of Infrastructure Components](#1-overview-of-infrastructure-components)
- [2. Deployment Process](#2-deployment-process)
  - [2.1 Cloudflare Pages (Frontend)](#21-cloudflare-pages-frontend)
  - [2.2 Cloudflare Worker (Backend API)](#22-cloudflare-worker-backend-api)
- [3. DNS & Clerk Configuration](#3-dns--clerk-configuration)
  - [3.1 Custom Domain for Frontend](#31-custom-domain-for-frontend)
  - [3.2 DNS Records for Clerk Authentication](#32-dns-records-for-clerk-authentication)
  - [3.3 CORS Configuration for Backend API](#33-cors-configuration-for-backend-api)
  - [3.4 Backend Clerk Environment Variables](#34-backend-clerk-environment-variables)
  - [3.5 Frontend Environment Variables](#35-frontend-environment-variables)
- [4. Database Setup & Migrations (Cloudflare D1)](#4-database-setup--migrations-cloudflare-d1)
- [5. Clerk Webhooks (Automated User Sync)](#5-clerk-webhooks-automated-user-sync)

---

## Assumptions & Prerequisites

Before deploying, ensure you have:

- A registered domain name (e.g., `example.com`) with access to modify its DNS settings.
- A **Cloudflare** account for deploying Pages, Workers, and D1 Database.
- A **Clerk** account for user authentication & management.
- Node.js (v18+) and `pnpm` (or `npm`) installed locally.

---

## 1. Overview of Infrastructure Components

The Voting System leverages Cloudflare's serverless ecosystem:

| Component | Platform / Tech | Description |
| :--- | :--- | :--- |
| **Frontend** | Cloudflare Pages (React + Vite) | Web interface hosted on Cloudflare's edge network |
| **Backend API** | Cloudflare Workers (Hono.js) | Serverless REST API endpoints |
| **Authentication** | Clerk | Identity management & JWT auth |
| **Database** | Cloudflare D1 | Serverless SQLite-based SQL database |
| **DNS Management** | Domain Registrar / Cloudflare DNS | Manages routing for custom subdomains |

---

## 2. Deployment Process

### 2.1 Cloudflare Pages (Frontend)

1. **Connect to Cloudflare Pages:**
   - Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
   - Go to **Workers & Pages** $\rightarrow$ **Create application** $\rightarrow$ **Pages** tab $\rightarrow$ **Connect to Git**.
   - Select your repository (`voting-system`) and choose the `main` branch.

2. **Configure Build Settings:**
   - **Framework preset:** `None` (or `Vite`)
   - **Build command:** `pnpm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `apps/web`

3. **Deploy:**
   - Click **Save and Deploy**. Cloudflare will generate a default hostname like `voting-system-xyz.pages.dev`.

### 2.2 Cloudflare Worker (Backend API)

1. **Connect to Cloudflare Workers:**
   - In Cloudflare Dashboard, go to **Workers & Pages** $\rightarrow$ **Create application** $\rightarrow$ **Workers** tab $\rightarrow$ **Connect to Git** (or deploy via CLI).
   - If deploying via Git integration:
     - **Build command:** `pnpm run build`
     - **Deploy command:** `npx wrangler deploy`
     - **Root directory:** `apps/api`
   - Alternatively, deploy directly from your local terminal inside `apps/api`:
     ```bash
     cd apps/api
     npx wrangler deploy
     ```

2. **Deploy:**
   - Cloudflare will assign a default endpoint URL like `https://voting-system-api.workers.dev`.

---

## 3. DNS & Clerk Configuration

### 3.1 Custom Domain for Frontend

1. **Add Custom Domain in Cloudflare Pages:**
   - Open your Pages project in Cloudflare Dashboard.
   - Go to **Settings** $\rightarrow$ **Custom domains** $\rightarrow$ **Set up a custom domain**.
   - Enter your target subdomain (e.g., `vote.example.com`).

2. **Configure DNS at Your Domain Registrar:**
   - Log in to your domain registrar (e.g., Porkbun, Namecheap, GoDaddy).
   - Add the following `CNAME` record:
     | Type | Host / Name | Target / Value |
     | :--- | :--- | :--- |
     | `CNAME` | `vote` | `your-pages-app.pages.dev` |

3. **Verify:** Wait for DNS propagation until the custom domain shows as **Active** in Cloudflare.

---

### 3.2 DNS Records for Clerk Authentication

To securely handle authentication without origin conflicts, use a dedicated sibling subdomain (e.g., `clerk.example.com`).

> [!IMPORTANT]
> **Nested Subdomains & Primary Domain in Clerk**  
> If using nested subdomains (e.g., `vote.app.example.com`), make sure to set this as the **Primary Domain** in the Clerk Dashboard under **Domains** settings to prevent DNS resolution failures.

#### 1. Add DNS Records at Your Registrar:

- **Frontend API (Required):**
  | Type | Host / Name | Target / Value |
  | :--- | :--- | :--- |
  | `CNAME` | `clerk` | `frontend-api.clerk.services` |

- **Account Portal (Optional, Recommended):**
  | Type | Host / Name | Target / Value |
  | :--- | :--- | :--- |
  | `CNAME` | `accounts` | `accounts.clerk.services` |

- **Email Sending Domains (Required for Email Verification):**
  | Type | Host / Name | Target / Value |
  | :--- | :--- | :--- |
  | `CNAME` | `clkmail` | `mail.<your_clerk_id>.clerk.services` |
  | `CNAME` | `clk._domainkey` | `dkim1.<your_clerk_id>.clerk.services` |
  | `CNAME` | `clk2._domainkey` | `dkim2.<your_clerk_id>.clerk.services` |

*(Retrieve `<your_clerk_id>` from **Clerk Dashboard** $\rightarrow$ **Domains** $\rightarrow$ **Email sending domains**).*

#### 2. Update Clerk Dashboard Settings:
- Navigate to **Clerk Dashboard** $\rightarrow$ **Developers** $\rightarrow$ **Domains**.
- Under Production settings, verify that `clerk.example.com` is registered as your **Frontend API URL**.

#### 3. Update Cloudflare Pages Environment Variable:
- Go to Cloudflare Pages $\rightarrow$ **Settings** $\rightarrow$ **Environment variables**.
- Set `VITE_CLERK_PROXY_URL` = `https://clerk.example.com`.

#### 4. Verification:
- Open `https://clerk.example.com` in your browser. You should receive a JSON response or error page directly from Clerk (not your app's HTML), confirming DNS resolution.

---

### 3.3 CORS Configuration for Backend API

Update `apps/api/src/index.ts` (or your entry point) to allow requests from your frontend domain:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: ['https://vote.example.com'], // Replace with your frontend domain
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

export default app;
```

---

### 3.4 Backend Clerk Environment Variables

Cloudflare Workers require secrets to be securely set rather than committed to source control.

#### Retrieve API Keys:
1. Go to **Clerk Dashboard** $\rightarrow$ **API Keys**.
2. Copy the **Publishable Key** (`pk_live_...`) and **Secret Key** (`sk_live_...`).

#### Store Secrets via Wrangler CLI:
Run from `apps/api`:

```bash
npx wrangler secret put CLERK_PUBLISHABLE_KEY
# Paste Publishable Key when prompted

npx wrangler secret put CLERK_SECRET_KEY
# Paste Secret Key when prompted

npx wrangler secret put CLERK_WEBHOOK_SECRET
# Paste Webhook Secret when prompted
```

---

### 3.5 Frontend Environment Variables

Configure environment variables in Cloudflare Pages under **Settings** $\rightarrow$ **Environment variables**:

| Variable Name | Value Example | Description |
| :--- | :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Clerk Publishable Key |
| `VITE_API_URL` | `https://voting-system-api.workers.dev` | Deployed Worker API base URL |
| `VITE_CLERK_PROXY_URL` | `https://clerk.example.com` | Custom Clerk proxy endpoint |

> [!NOTE]
> Trigger a new Cloudflare Pages deployment after updating environment variables for changes to take effect.

---

## 4. Database Setup & Migrations (Cloudflare D1)

### 1. Create D1 Database:
In Cloudflare Dashboard, navigate to **Workers & Pages** $\rightarrow$ **D1** $\rightarrow$ **Create database** (e.g., named `voting-system-db`). Note the generated Database ID.

### 2. Configure `wrangler.toml`:
In `apps/api/wrangler.toml`, add the D1 database binding:

```toml
name = "voting-system-worker"
main = "src/index.ts"
compatibility_date = "2026-04-08"

[[d1_databases]]
binding = "DB"
database_name = "voting-system-db"
database_id = "YOUR_UNIQUE_D1_DATABASE_ID"
```

### 3. Execute Schema Migrations:
Apply your SQL migrations to the remote D1 instance:

```bash
# Execute against the remote D1 database
npx wrangler d1 execute voting-system-db --remote --file=./drizzle/schema.sql
```

---

## 5. Clerk Webhooks (Automated User Sync)

To keep your Cloudflare D1 user records in sync with Clerk authentication state:

1. **Create Webhook Handler in Worker (`apps/api`):**
   - Ensure an endpoint like `POST /api/webhooks/clerk` is configured.
   - Use `svix` to verify incoming webhook signatures using `CLERK_WEBHOOK_SECRET`.
   - Insert/update the user record in Cloudflare D1 upon `user.created` / `user.updated` events.

2. **Configure Endpoint in Clerk Dashboard:**
   - In **Clerk Dashboard**, go to **Webhooks** $\rightarrow$ **Add Endpoint**.
   - **Endpoint URL:** `https://voting-system-api.workers.dev/api/webhooks/clerk`
   - **Subscribe to events:** `user.created`, `user.updated`, `user.deleted`.

3. **Save Webhook Secret:**
   - Copy the generated `whsec_...` secret from Clerk.
   - Add it to your worker:
     ```bash
     npx wrangler secret put CLERK_WEBHOOK_SECRET
     ```
