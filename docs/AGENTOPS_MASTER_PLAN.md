# AgentOps Master Plan v3 — pathofsoler.com

## Locked decisions

| Decision        | Choice                                                               |
| --------------- | -------------------------------------------------------------------- |
| CRM domain      | **pathofsoler.com** (Cloudflare DNS → self-hosted Twenty on Coolify) |
| AgentOps domain | **agentops.pathofsoler.com** (Cloudflare DNS → Vercel)               |
| Sign-in         | **On-domain** — `agentops.pathofsoler.com/login` and `/signup`       |
| Repo strategy   | **Evolve `lobe-chat` in place**                                      |
| Auth            | **Clerk multi-tenant** (Organizations)                               |
| Integrations    | **Full Pipedream catalog** in UI (paginated + featured)              |
| Artifacts       | **Vercel Sandbox** (isolated preview, future-proof)                  |
| Billing         | Internal-only until later phases                                     |

## Architecture

```
pathofsoler.com → Twenty CRM (self-hosted on Coolify, crm.nebulis.one server)
agentops.pathofsoler.com → AgentOps (Vercel)
  ├── Clerk auth on-domain (/login, /signup) + Organizations
  ├── Pipedream Connect + MCP
  ├── Integrations catalog (/integrations)
  ├── Agent chat + MCP tool router
  ├── Artifacts → Vercel Sandbox
  └── Postgres (server mode)
```

## DNS

### pathofsoler.com (Cloudflare zone `36ca0956c4139d015cbfb35d1297baa0`) — Twenty CRM

Twenty is **self-hosted** on Coolify (`twenty-os` app), not Twenty Cloud. Do **not** CNAME to `custom-domain.twenty.com`.

| Record                       | Value                         | Proxy    |
| ---------------------------- | ----------------------------- | -------- |
| `pathofsoler.com` A          | `5.161.72.226`                | DNS only |
| `www.pathofsoler.com` A      | `5.161.72.226`                | DNS only |
| `agentops.pathofsoler.com` A | `76.76.21.21`                 | DNS only |
| `clerk.agentops` CNAME       | `frontend-api.clerk.services` | DNS only |

Coolify app domains: `crm.nebulis.one`, `pathofsoler.com`, `www.pathofsoler.com`.\
Twenty env: `SERVER_URL=https://pathofsoler.com`, `FRONTEND_URL=https://pathofsoler.com`.

`app.pathofsoler.com` is reserved/broken in Cloudflare (NXDOMAIN) — use `agentops.pathofsoler.com` for AgentOps.

### pathofsoler.one (Cloudflare zone `2891c72ffe12c88e336609975deca699`)

| Record            | Value                      | Proxy    |
| ----------------- | -------------------------- | -------- |
| `pathofsoler.one` | `custom-domain.twenty.com` | DNS only |
| `www` CNAME       | `custom-domain.twenty.com` | DNS only |

**Nameservers** (set at your registrar if zone is still pending):

- `brynne.ns.cloudflare.com`
- `carter.ns.cloudflare.com`

### Vercel domains on `lobe-chat`

- `agentops.pathofsoler.com` (production AgentOps)
- `app.pathofsoler.com` redirects to `agentops` in `vercel.json` (DNS broken; do not use)

`pathofsoler.com` and `www.pathofsoler.com` are **not** on Vercel — they point at the Coolify Twenty server.

## Required environment variables

```env
NEXT_PUBLIC_AGENTOPS_APP_URL=https://agentops.pathofsoler.com
NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME=AgentOps
NEXT_PUBLIC_SERVICE_MODE=server
DATABASE_URL=...
KEY_VAULTS_SECRET=...

# Clerk — primary on app.pathofsoler.com (no satellite vars unless intentional)
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

1.  Add `app.pathofsoler.com` as a production domain
2.  Enable **Organizations**
3.  Set sign-in/sign-up URLs to `https://app.pathofsoler.com/login` and `/signup`
4.  Add allowed redirect origins for all app hosts

## Key routes

| Route            | Purpose                              |
| ---------------- | ------------------------------------ |
| `/login`         | Clerk sign-in on app.pathofsoler.com |
| `/signup`        | Clerk sign-up on app.pathofsoler.com |
| `/integrations`  | Connector catalog + connect          |
| `/api/artifacts` | Vercel Sandbox artifact preview      |
