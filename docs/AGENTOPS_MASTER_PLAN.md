# AgentOps Master Plan v3 — pathofsoler.com

## Locked decisions

| Decision      | Choice                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| Domain        | **pathofsoler.com** (Cloudflare DNS → Vercel)                                  |
| Sign-in       | **On-domain** — `pathofsoler.com/login` and `/signup` (not external satellite) |
| Repo strategy | **Evolve `lobe-chat` in place**                                                |
| Auth          | **Clerk multi-tenant** (Organizations)                                         |
| Integrations  | **Full Pipedream catalog** in UI (paginated + featured)                        |
| Artifacts     | **Vercel Sandbox** (isolated preview, future-proof)                            |
| Billing       | Internal-only until later phases                                               |

## Architecture

```
pathofsoler.com (Vercel)
  ├── Clerk auth on-domain (/login, /signup) + Organizations
  ├── Pipedream Connect + MCP (remote.mcp.pipedream.net/v3)
  ├── Integrations catalog (/integrations) — paginated Pipedream app list
  ├── Agent chat + MCP tool router
  ├── Artifacts → Vercel Sandbox live preview
  └── Postgres (server mode) — users, connections, artifacts, runs
```

### External user ID (Pipedream)

- Personal workspace: `user_{clerkUserId}`
- Org workspace: `org_{clerkOrgId}`

## DNS (configured)

| Record              | Value                  | Proxy    |
| ------------------- | ---------------------- | -------- |
| `pathofsoler.com` A | `76.76.21.21`          | DNS only |
| `www` CNAME         | `cname.vercel-dns.com` | DNS only |

Vercel redirects `www.pathofsoler.com` → `pathofsoler.com`.

## Required environment variables

```env
# App
NEXT_PUBLIC_AGENTOPS_APP_URL=https://pathofsoler.com
NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME=AgentOps
NEXT_PUBLIC_SERVICE_MODE=server
DATABASE_URL=...
KEY_VAULTS_SECRET=...

# Clerk — primary on pathofsoler.com (do NOT set satellite vars unless using external primary)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Pipedream
PIPEDREAM_CLIENT_ID=...
PIPEDREAM_CLIENT_SECRET=...
PIPEDREAM_PROJECT_ID=...
PIPEDREAM_PROJECT_ENVIRONMENT=production
```

### Clerk dashboard checklist

1.  Add `pathofsoler.com` as production domain in Clerk
2.  Enable **Organizations** in Clerk dashboard
3.  Set sign-in/sign-up URLs to `https://pathofsoler.com/login` and `/signup`
4.  Do **not** enable satellite mode unless you intentionally share auth with another primary app

Copy Pipedream + Clerk keys from `vercelchatbot` or `agentops-mcp-chat`, but **omit** satellite env vars.

## Implementation phases

### Phase 0 — Platform (in progress)

- [x] DNS + Vercel domains + www redirect
- [x] On-domain Clerk auth (`/login`, `/signup`)
- [x] Paginated Pipedream catalog API (no full 3000+ app memory load)
- [x] Connect flow with dynamic allowed origins
- [x] Integrations UI with infinite scroll + featured section
- [x] Clerk Organizations switcher
- [x] DB migration: `connected_accounts`, `artifacts`
- [x] MCP client scaffold
- [x] Vercel Sandbox artifact preview scaffold
- [ ] Enable server mode + Clerk on production
- [ ] Wire MCP tools into chat pipeline
- [ ] Operator shell UI overhaul

### Phase 1 — MCP in chat

- Tool discovery per connected app
- Connect Link recovery inline in chat
- Run ledger

### Phase 2 — Artifacts flagship

- Split-pane artifact panel in chat
- Persist artifacts to DB + Blob
- Version history

### Phase 3 — Operator modes + scheduling

### Phase 4 — Billing (Stripe from `claw-ops-web`)

## Key routes

| Route                                      | Purpose                           |
| ------------------------------------------ | --------------------------------- |
| `/login`                                   | Clerk sign-in on pathofsoler.com  |
| `/signup`                                  | Clerk sign-up on pathofsoler.com  |
| `/integrations`                            | Connector catalog + connect       |
| `GET /api/integrations/apps`               | Paginated Pipedream apps          |
| `GET /api/integrations/apps?featured=true` | Featured connectors               |
| `POST /api/integrations/connect`           | Start OAuth via Connect Link      |
| `GET /api/integrations/accounts`           | List connected accounts           |
| `POST /api/artifacts`                      | Deploy artifact to Vercel Sandbox |
