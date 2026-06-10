/* eslint-disable sort-keys-fix/sort-keys-fix */
import { integer, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';

import { createdAt, timestamptz, updatedAt } from './_helpers';
import { users } from './user';

export const connectedAccounts = pgTable(
  'connected_accounts',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    orgId: text('org_id'),
    appSlug: text('app_slug').notNull(),
    pipedreamAccountId: text('pipedream_account_id'),
    status: text('status').notNull().default('pending'),
    metadata: jsonb('metadata'),
    connectedAt: timestamptz('connected_at'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    userOrgAppUnique: uniqueIndex('connected_accounts_user_org_app_idx').on(
      table.userId,
      table.orgId,
      table.appSlug,
    ),
  }),
);

export const artifacts = pgTable('artifacts', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  orgId: text('org_id'),
  sessionId: text('session_id'),
  title: text('title').notNull(),
  type: text('type').notNull(),
  content: text('content'),
  blobUrl: text('blob_url'),
  sandboxId: text('sandbox_id'),
  previewUrl: text('preview_url'),
  version: integer('version').notNull().default(1),
  metadata: jsonb('metadata'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type ConnectedAccountItem = typeof connectedAccounts.$inferSelect;
export type NewConnectedAccount = typeof connectedAccounts.$inferInsert;
export type ArtifactItem = typeof artifacts.$inferSelect;
export type NewArtifact = typeof artifacts.$inferInsert;
