# 🗳️ Voting System

An open-source, serverless voting and polling platform built with high performance, global edge deployment, and secure authentication.

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite (deployed on **Cloudflare Pages**)
- **Backend:** Hono.js REST API (deployed on **Cloudflare Workers**)
- **Database:** Cloudflare D1 (Serverless SQLite at the edge)
- **Authentication:** Clerk Auth (JWT verification & webhooks sync)
- **Monorepo Management:** Turborepo + pnpm workspaces

---

## 📁 Repository Structure

```text
voting-system/
├── apps/
│   ├── api/             # Hono backend running on Cloudflare Workers
│   ├── web/             # React + Vite frontend running on Cloudflare Pages
│   ├── clerk-proxy/     # Clerk authentication proxy configuration
│   └── tigger-email/    # Email notification service
└── DEPLOYMENT.md        # Complete self-deployment & infrastructure guide
```

---

## 🚀 Quick Start (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kaushik4141/voting-system.git
   cd voting-system
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   - Frontend (`apps/web`): Copy `.env.example` to `.env`
   - Backend (`apps/api`): Copy `.dev.vars.example` to `.dev.vars`


4. **Start development servers:**
   ```bash
   pnpm dev
   ```

---

## 🌐 Self-Deployment & Infrastructure Guide

Planning to deploy your own instance of the Voting System? 

Check out our comprehensive **[Self-Deployment & Infrastructure Guide](./DEPLOYMENT.md)** for detailed instructions on:
- Cloudflare Pages & Workers deployment
- Custom Domain & DNS configuration
- Cloudflare D1 Database migrations
- Clerk Authentication setup & Webhooks user synchronization

