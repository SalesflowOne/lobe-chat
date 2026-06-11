# AgentOps Master Plan v3 — pathofsoler.com

## Locked decisions

| Decision        | Choice                                                               |
| --------------- | -------------------------------------------------------------------- |
| CRM domain      | **pathofsoler.com** (Cloudflare DNS → self-hosted Twenty on Coolify) |
| AgentOps domain | **pathofsoler.one** (Cloudflare DNS → Vercel)                        |
| Sign-in         | **On-domain** — `pathofsoler.one/login` and `/signup`                |
| Repo strategy   | **Evolve `lobe-chat` in place**                                      |
| Auth            | **Supabase Auth** (branded on-domain login/signup/profile)           |
| Integrations    | **Full Pipedream catalog** in UI (paginated + featured)              |
| Artifacts       | **Vercel Sandbox** (isolated preview, future-proof)                  |
| Billing         | Internal-only until later phases                                     |

## Architecture

```
pathofsoler.com → Twenty CRM (self-hosted on Coolify, crm.nebulis.one server)
pathofsoler.one → AgentOps / LobeChat (Vercel)
  ├── Supabase Auth on-domain (/login, /signup, /profile)
  ├── Pipedream Connect + MCP
  ├── Integrations catalog (/integrations)
  ├── Agent chat + MCP tool router
  ├── Artifacts → Vercel Sandbox
  └── Postgres (server mode)
```

## DNS

### pathofsoler.com (Cloudflare zone `36ca0956c4139d015cbfb35d1297baa0`) — Twenty CRM

Twenty is **self-hosted** on Coolify (`twenty-os` app), not Twenty Cloud. Do **not** CNAME to `custom-domain.twenty.com`.

| Record                       | Value          | Proxy    |
| ---------------------------- | -------------- | -------- |
| `pathofsoler.com` A          | `5.161.72.226` | DNS only |
| `www.pathofsoler.com` A      | `5.161.72.226` | DNS only |
| `agentops.pathofsoler.com` A | `76.76.21.21`  | DNS only |

Coolify app domains: `crm.nebulis.one`, `pathofsoler.com`, `www.pathofsoler.com`.\
Twenty env: `SERVER_URL=https://pathofsoler.com`, `FRONTEND_URL=https://pathofsoler.com`.

`app.pathofsoler.com` is reserved/broken in Cloudflare (NXDOMAIN) — use `agentops.pathofsoler.com` for AgentOps.

### pathofsoler.one (Cloudflare zone `2891c72ffe12c88e336609975deca699`) — AgentOps / LobeChat

| Record                  | Value         | Proxy    |
| ----------------------- | ------------- | -------- |
| `pathofsoler.one` A     | `76.76.21.21` | DNS only |
| `www.pathofsoler.one` A | `76.76.21.21` | DNS only |

**Nameservers** (required at registrar — zone is pending until these are set):

- `brynne.ns.cloudflare.com`
- `carter.ns.cloudflare.com`

**Nameservers** (set at your registrar if zone is still pending):

- `brynne.ns.cloudflare.com`
- `carter.ns.cloudflare.com`

### Vercel domains on `lobe-chat`

- `pathofsoler.one`, `www.pathofsoler.one` (production AgentOps)
- `agentops.pathofsoler.com` (redirects to `pathofsoler.one`)
- `app.pathofsoler.com` redirects to `agentops` in `vercel.json` (DNS broken; do not use)

`pathofsoler.com` and `www.pathofsoler.com` are **not** on Vercel — they point at the Coolify Twenty server.

## Required environment variables

```env
NEXT_PUBLIC_AGENTOPS_APP_URL=https://pathofsoler.one
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

1.  Enable email/password auth in Supabase dashboard
2.  Set site URL to `https://pathofsoler.one`
3.  Add redirect URLs: `/auth/callback`, `/reset-password`
4.  Run migration `0006_supabase_auth.sql` on the app database

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
