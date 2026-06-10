CREATE TABLE IF NOT EXISTS "connected_accounts" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "org_id" text,
  "app_slug" text NOT NULL,
  "pipedream_account_id" text,
  "status" text DEFAULT 'pending' NOT NULL,
  "metadata" jsonb,
  "connected_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "connected_accounts_user_org_app_idx"
  ON "connected_accounts" ("user_id", "org_id", "app_slug");

CREATE TABLE IF NOT EXISTS "artifacts" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "org_id" text,
  "session_id" text,
  "title" text NOT NULL,
  "type" text NOT NULL,
  "content" text,
  "blob_url" text,
  "sandbox_id" text,
  "preview_url" text,
  "version" integer DEFAULT 1 NOT NULL,
  "metadata" jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
