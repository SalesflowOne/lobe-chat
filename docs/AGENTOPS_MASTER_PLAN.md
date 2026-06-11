# AgentOps Master Plan v3 — pathofsoler.com

## Locked decisions

| Decision         | Choice                                                  |
| ---------------- | ------------------------------------------------------- |
| Canonical domain | **pathofsoler.com** (Cloudflare DNS → Vercel)           |
| Alternate domain | **pathofsoler.one** redirects → pathofsoler.com         |
| Sign-in          | **On-domain** — `pathofsoler.com/login` and `/signup`   |
| Repo strategy    | **Evolve `lobe-chat` in place**                         |
| Auth             | **Clerk multi-tenant** (Organizations)                  |
| Integrations     | **Full Pipedream catalog** in UI (paginated + featured) |
| Artifacts        | **Vercel Sandbox** (isolated preview, future-proof)     |
| Billing          | Internal-only until later phases                        |

## Architecture

```
pathofsoler.com (canonical)
  ├── pathofsoler.one → 301 redirect
  ├── Clerk auth on-domain (/login, /signup) + Organizations
  ├── Pipedream Connect + MCP
  ├── Integrations catalog (/integrations)
  ├── Agent chat + MCP tool router
  ├── Artifacts → Vercel Sandbox
  └── Postgres (server mode)
```

## DNS

### pathofsoler.one (Cloudflare zone `2891c72ffe12c88e336609975deca699`)

| Record              | Value                  | Proxy    |
| ------------------- | ---------------------- | -------- |
| `pathofsoler.one` A | `76.76.21.21`          | DNS only |
| `www` CNAME         | `cname.vercel-dns.com` | DNS only |

**Nameservers** (set at your registrar if zone is still pending):

- `brynne.ns.cloudflare.com`
- `carter.ns.cloudflare.com`

### pathofsoler.com (existing zone)

| Record              | Value                  | Proxy    |
| ------------------- | ---------------------- | -------- |
| `pathofsoler.com` A | `76.76.21.21`          | DNS only |
| `www` CNAME         | `cname.vercel-dns.com` | DNS only |

Vercel redirects `pathofsoler.one`, `www.pathofsoler.one`, and `www.pathofsoler.com` → `pathofsoler.com`.

### Vercel domains on `lobe-chat`

- `pathofsoler.one`, `www.pathofsoler.one`
- `pathofsoler.com`, `www.pathofsoler.com`

## Required environment variables

```env
NEXT_PUBLIC_AGENTOPS_APP_URL=https://pathofsoler.com
NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME=AgentOps
NEXT_PUBLIC_SERVICE_MODE=server
DATABASE_URL=...
KEY_VAULTS_SECRET=...

# Clerk — primary on pathofsoler.com (no satellite vars unless intentional)
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

1.  Add **both** `pathofsoler.one` and `pathofsoler.com` as production domains
2.  Enable **Organizations**
3.  Set sign-in/sign-up URLs to `https://pathofsoler.com/login` and `/signup`
4.  Add allowed redirect origins for all app hosts

## Key routes

| Route            | Purpose                          |
| ---------------- | -------------------------------- |
| `/login`         | Clerk sign-in on pathofsoler.com |
| `/signup`        | Clerk sign-up on pathofsoler.com |
| `/integrations`  | Connector catalog + connect      |
| `/api/artifacts` | Vercel Sandbox artifact preview  |
