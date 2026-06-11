# AgentOps Master Plan v3 — agentcloud.one

## Locked decisions

| Decision        | Choice                                                               |
| --------------- | -------------------------------------------------------------------- |
| CRM domain      | **pathofsoler.com** (Cloudflare DNS → self-hosted Twenty on Coolify) |
| AgentOps domain | **agentcloud.one** (Cloudflare DNS → Vercel)                         |
| Sign-in         | **On-domain** — `agentcloud.one/login` and `/signup`                 |
| Repo strategy   | **Evolve `lobe-chat` in place**                                      |
| Auth            | **Supabase Auth** (branded on-domain login/signup/profile)           |
| Integrations    | **Full Pipedream catalog** in UI (paginated + featured)              |
| Artifacts       | **Vercel Sandbox** (isolated preview, future-proof)                  |
| Billing         | Internal-only until later phases                                     |

## Architecture

```
pathofsoler.com → Twenty CRM (self-hosted on Coolify)
agentcloud.one → AgentOps / LobeChat (Vercel)
  ├── pathofsoler.one / legacy subdomains → 301 redirect
  ├── Supabase Auth on-domain (/login, /signup, /profile)
  ├── Pipedream Connect + MCP
  ├── Integrations catalog (/integrations)
  ├── Agent chat + MCP tool router
  ├── Artifacts → Vercel Sandbox
  └── Postgres (server mode)
```

## DNS

### agentcloud.one (Cloudflare zone `fee398b55ffedf87e9e7062853171771`) — AgentOps / LobeChat

| Record               | Value                                       | Proxy    |
| -------------------- | ------------------------------------------- | -------- |
| `agentcloud.one` A   | `216.198.79.1` (Vercel)                     | DNS only |
| `www.agentcloud.one` | `8c77c1e216f721f1.vercel-dns-017.com` (CNAME) | DNS only |

**Nameservers** (active):

- `brynne.ns.cloudflare.com`
- `carter.ns.cloudflare.com`

### pathofsoler.com (Cloudflare zone `36ca0956c4139d015cbfb35d1297baa0`) — Twenty CRM

Twenty is **self-hosted** on Coolify (`twenty-os` app), not Twenty Cloud.

| Record                       | Value          | Proxy    |
| ---------------------------- | -------------- | -------- |
| `pathofsoler.com` A          | `5.161.72.226` | DNS only |
| `www.pathofsoler.com` A      | `5.161.72.226` | DNS only |
| `agentops.pathofsoler.com` A | `76.76.21.21` | DNS only |

`pathofsoler.com` apex serves Twenty CRM. `agentops.pathofsoler.com` redirects to `agentcloud.one` via Vercel.

### Vercel domains on `lobe-chat`

- `agentcloud.one`, `www.agentcloud.one` (production AgentOps)
- Legacy redirects via `vercel.json`: `pathofsoler.one`, `pathofsoler.com`, `agentops.pathofsoler.com`

## Required environment variables

```env
NEXT_PUBLIC_AGENTOPS_APP_URL=https://agentcloud.one
NEXT_PUBLIC_AGENTOPS_PRODUCT_NAME=AgentOps
NEXT_PUBLIC_SERVICE_MODE=server
DATABASE_URL=...
KEY_VAULTS_SECRET=...

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Pipedream
PIPEDREAM_CLIENT_ID=...
PIPEDREAM_CLIENT_SECRET=...
PIPEDREAM_PROJECT_ID=...
PIPEDREAM_PROJECT_ENVIRONMENT=production
```

### Supabase Auth checklist

1. Enable email/password auth in Supabase dashboard
2. Set site URL to `https://agentcloud.one`
3. Add redirect URLs: `https://agentcloud.one/auth/callback`, `https://agentcloud.one/reset-password`
4. Add preview URL wildcard if using Vercel previews: `https://*-salesflow.vercel.app/**`

## Key routes

| Route              | Purpose                           |
| ------------------ | --------------------------------- |
| `/login`           | Branded sign-in (Supabase)        |
| `/signup`          | Branded registration (Supabase)   |
| `/forgot-password` | Password reset request            |
| `/reset-password`  | Set new password after email link |
| `/profile`         | Account profile and sign-out      |
| `/integrations`    | Connector catalog + connect       |
| `/api/artifacts`   | Vercel Sandbox artifact preview   |
