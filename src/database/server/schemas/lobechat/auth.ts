/* eslint-disable sort-keys-fix/sort-keys-fix */
import { pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';

import { createdAt, timestamptz, updatedAt } from './_helpers';
import { users } from './user';

/** Global profile fields — OneAccess-ready shared identity. */
export const profiles = pgTable('profiles', {
  id: text('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  displayName: text('display_name'),
  email: text('email'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const userRoles = pgTable(
  'user_roles',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: text('role').notNull().default('user'),
    appId: text('app_id').notNull().default('agentops'),
    createdAt: createdAt(),
  },
  (table) => ({
    userAppRoleIdx: uniqueIndex('user_roles_user_app_role_idx').on(
      table.userId,
      table.appId,
      table.role,
    ),
  }),
);

/** Future OneAccess app/module access grants. */
export const appAccess = pgTable(
  'app_access',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    appId: text('app_id').notNull().default('agentops'),
    grantedAt: timestamptz('granted_at').notNull(),
    expiresAt: timestamptz('expires_at'),
  },
  (table) => ({
    userAppIdx: uniqueIndex('app_access_user_app_idx').on(table.userId, table.appId),
  }),
);

export type ProfileItem = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type UserRoleItem = typeof userRoles.$inferSelect;
export type AppAccessItem = typeof appAccess.$inferSelect;
