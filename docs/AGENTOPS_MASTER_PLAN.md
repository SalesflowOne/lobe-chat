# AgentOps Master Plan v3 — agentcloud.one

## Locked decisions

| Decision         | Choice                                                  |
| ---------------- | ------------------------------------------------------- |
| Canonical domain | **agentcloud.one** (Cloudflare DNS → Vercel)           |
| Legacy domains   | `pathofsoler.one`, `pathofsoler.com` → redirect         |
| Sign-in          | **On-domain** — `agentcloud.one/login` and `/signup`      |
| Repo strategy    | **Evolve `lobe-chat` in place**                         |
| Auth             | **Supabase Auth**                                       |
| Integrations     | **Full Pipedream catalog** in UI (paginated + featured) |
| Artifacts        | **Vercel Sandbox** (isolated preview, future-proof)     |
| Billing          | Internal-only until later phases                        |

## Architecture

```
agentcloud.one (canonical)
  ├── pathofsoler.one / pathofsoler.com → 301 redirect
  ├── Supabase auth on-domain (/login, /signup)
  ├── Pipedream Connect + MCP
  ├── Integrations catalog (/integrations)
  ├── Agent chat + MCP tool router
  ├── Artifacts → Vercel Sandbox
  └── Postgres (server mode)
```

## DNS

### agentcloud.one (Cloudflare zone `fee398b55ffedf87e9e7062853171771`) — AgentOps / LobeChat

| Record                  | Value                              | Proxy    |
| ----------------------- | ---------------------------------- | -------- |
| `agentcloud.one` A      | `216.198.79.1` (Vercel)            | DNS only |
| `www.agentcloud.one`    | `8c77c1e216f721f1.vercel-dns-017.com` (CNAME) | DNS only |

**Nameservers** (active):

- `brynne.ns.cloudflare.com`
- `carter.ns.cloudflare.com`

### pathofsoler.com (Twenty CRM — separate)

| Record              | Value         | Purpose        |
| ------------------- | ------------- | -------------- |
| `pathofsoler.com` A | `5.161.72.226` | Self-hosted CRM |

### Vercel domains on `lobe-chat`

- `agentcloud.one`, `www.agentcloud.one`
- Legacy redirects via `vercel.json`: `pathofsoler.one`, `pathofsoler.com`, `agentops.pathofsoler.com`

## Required environment variables

```env
NEXT_PUBLIC_AGENTOPS_APP_URL=https://agentcloud.one
NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME=AgentOps
NEXT_PUBLIC_SERVICE_MODE=server
DATABASE_URL=...
KEY_VAULTS_SECRET=...

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Pipedream
PIPEDREAM_CLIENT_ID=...
PIPEDREAM_CLIENT_SECRET=...
PIPEDREAM_PROJECT_ID=...
PIPEDREAM_PROJECT_ENVIRONMENT=production
```

### Supabase dashboard checklist

1. Set site URL to `https://agentcloud.one`
2. Add redirect URLs: `https://agentcloud.one/auth/callback`, `https://agentcloud.one/reset-password`
3. Add preview URL wildcard if using Vercel previews: `https://*-salesflow.vercel.app/**`

## Key routes

| Route            | Purpose                          |
| ---------------- | -------------------------------- |
| `/login`         | Sign-in on agentcloud.one        |
| `/signup`        | Sign-up on agentcloud.one        |
| `/integrations`  | Connector catalog + connect      |
| `/api/artifacts` | Vercel Sandbox artifact preview  |
