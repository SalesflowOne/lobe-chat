# AgentOps Master Plan v3 — pathofsoler.com

## Locked decisions

| Decision      | Choice                                                       |
| ------------- | ------------------------------------------------------------ |
| Domain        | **pathofsoler.com** (Cloudflare DNS → Vercel)                |
| Repo strategy | **Evolve `lobe-chat` in place**                              |
| Auth          | **Clerk multi-tenant** (Organizations)                       |
| Integrations  | **Full Pipedream catalog** in UI (featured + all connectors) |
| Artifacts     | **Vercel Sandbox** (isolated preview, future-proof)          |
| Billing       | Internal-only until later phases                             |

## Architecture

```
pathofsoler.com (Vercel)
  ├── Clerk Organizations (workspace tenancy)
  ├── Pipedream Connect + MCP (remote.mcp.pipedream.net/v3)
  ├── Integrations catalog (/integrations) — full app list from Pipedream API
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

Vercel project `lobe-chat` has `pathofsoler.com` and `www.pathofsoler.com` attached.

## Required environment variables

```env
# App
NEXT_PUBLIC_AGENTOPS_APP_URL=https://pathofsoler.com
NEXT_PUBLIC_SERVICE_MODE=server
DATABASE_URL=...
KEY_VAULTS_SECRET=...

# Clerk (multi-tenant satellite)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
CLERK_WEBHOOK_SECRET=...
NEXT_PUBLIC_CLERK_IS_SATELLITE=true
NEXT_PUBLIC_CLERK_DOMAIN=pathofsoler.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https:// < your-clerk-primary > /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https:// < your-clerk-primary > /sign-up

# Pipedream
PIPEDREAM_CLIENT_ID=...
PIPEDREAM_CLIENT_SECRET=...
PIPEDREAM_PROJECT_ID=...
PIPEDREAM_PROJECT_ENVIRONMENT=production
```

Copy Pipedream + Clerk vars from `vercelchatbot` or `agentops-mcp-chat`.

## Implementation phases

### Phase 0 — Platform (in progress)

- [x] DNS + Vercel domains
- [x] AgentOps config module
- [x] Pipedream catalog API (`GET /api/integrations/apps`)
- [x] Connect flow (`POST /api/integrations/connect`)
- [x] Integrations UI (`/integrations`)
- [x] Clerk satellite config + OrganizationSwitcher
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

| Route                        | Purpose                           |
| ---------------------------- | --------------------------------- |
| `/integrations`              | Full connector catalog + connect  |
| `/api/integrations/apps`     | Pipedream app list (cached)       |
| `/api/integrations/connect`  | Start OAuth via Connect Link      |
| `/api/integrations/accounts` | List connected accounts           |
| `/api/artifacts`             | Deploy artifact to Vercel Sandbox |
