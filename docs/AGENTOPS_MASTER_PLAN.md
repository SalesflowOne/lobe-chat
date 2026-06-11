# AgentOps Master Plan v3 — pathofsoler.com

## Locked decisions

| Decision        | Choice                                                    |
| --------------- | --------------------------------------------------------- |
| CRM domain      | **pathofsoler.com** (Cloudflare DNS → Twenty CRM)         |
| AgentOps domain | **app.pathofsoler.com** (Cloudflare DNS → Vercel)         |
| Sign-in         | **On-domain** — `app.pathofsoler.com/login` and `/signup` |
| Repo strategy   | **Evolve `lobe-chat` in place**                           |
| Auth            | **Clerk multi-tenant** (Organizations)                    |
| Integrations    | **Full Pipedream catalog** in UI (paginated + featured)   |
| Artifacts       | **Vercel Sandbox** (isolated preview, future-proof)       |
| Billing         | Internal-only until later phases                          |

## Architecture

```
pathofsoler.com → Twenty CRM (custom-domain.twenty.com)
app.pathofsoler.com → AgentOps (Vercel)
  ├── Clerk auth on-domain (/login, /signup) + Organizations
  ├── Pipedream Connect + MCP
  ├── Integrations catalog (/integrations)
  ├── Agent chat + MCP tool router
  ├── Artifacts → Vercel Sandbox
  └── Postgres (server mode)
```

## DNS

### pathofsoler.com (Cloudflare zone `36ca0956c4139d015cbfb35d1297baa0`) — Twenty CRM

| Record            | Value                         | Proxy    |
| ----------------- | ----------------------------- | -------- |
| `pathofsoler.com` | `custom-domain.twenty.com`    | DNS only |
| `www` CNAME       | `custom-domain.twenty.com`    | DNS only |
| `app` CNAME       | `cname.vercel-dns.com`        | DNS only |
| `clerk` CNAME     | `frontend-api.clerk.services` | DNS only |

Configure the custom domain in Twenty: **Settings → General → Workspace Domain**.

#### Twenty custom domain setup order (fixes Cloudflare Error 1014)

Cloudflare **Error 1014 (CNAME Cross-User Banned)** happens when `pathofsoler.com` CNAMEs to `custom-domain.twenty.com` **before** Twenty registers your domain on their Cloudflare for SaaS side.

**Correct order:**

1.  In Twenty: **Settings → General → Workspace Domain → Customize Domain** → enter `pathofsoler.com` and save.
2.  Wait until Twenty shows the domain as verified / active (can take a few minutes).
3.  In Cloudflare, replace the temporary Vercel A record with:
    - `pathofsoler.com` → CNAME `custom-domain.twenty.com` (**DNS only**, grey cloud)
    - `www` → CNAME `custom-domain.twenty.com` (**DNS only**)
4.  Remove the temporary Vercel redirects for `pathofsoler.com` / `www` from `vercel.json`.

**While waiting for step 2**, apex DNS points at Vercel and redirects to `https://pathofsoler.twenty.com` so the domain is not stuck on 1014.

### pathofsoler.one (Cloudflare zone `2891c72ffe12c88e336609975deca699`)

| Record            | Value                      | Proxy    |
| ----------------- | -------------------------- | -------- |
| `pathofsoler.one` | `custom-domain.twenty.com` | DNS only |
| `www` CNAME       | `custom-domain.twenty.com` | DNS only |

**Nameservers** (set at your registrar if zone is still pending):

- `brynne.ns.cloudflare.com`
- `carter.ns.cloudflare.com`

### Vercel domains on `lobe-chat`

- `app.pathofsoler.com`, `www.app.pathofsoler.com`

## Required environment variables

```env
NEXT_PUBLIC_AGENTOPS_APP_URL=https://app.pathofsoler.com
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
