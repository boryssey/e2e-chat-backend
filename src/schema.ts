import {getTableColumns} from 'drizzle-orm';
import {
	customType,
	integer,
	pgTable, serial, text, timestamp,
} from 'drizzle-orm/pg-core';

export const usersSchema = pgTable('users', {
	id: serial('id').unique(),
	username: text('username').notNull(),
	password: text('password').notNull(),
	created_at: timestamp('created_at').defaultNow(),
	deleted_at: timestamp('deleted_at'),
});

export type User = typeof usersSchema.$inferSelect;

const bytea = customType<{data: ArrayBuffer; notNull: false; default: false}>({
	dataType() {
		return 'bytea';
	},
});

export const keyBundleSchema = pgTable('key_bundles', {
	id: serial('id').unique(),
	user_id: integer('user_id').references(() => usersSchema.id).notNull(),
	identity_pub_key: bytea('identity_pub_key').notNull(),
	signed_pre_key_id: integer('signed_pre_key').notNull(),
	signed_pre_key_signature: bytea('signed_pre_key_signature').notNull(),
	signed_pre_key_pub_key: bytea('signed_pre_key_pub_key').notNull(),
	created_at: timestamp('created_at').defaultNow(),
	registration_id: integer('registration_id').notNull(),
});

export const oneTimeKeysSchema = pgTable('one_time_keys', {
	id: serial('id').unique(),
	key_bundle_id: integer('key_bundle_id').references(() => keyBundleSchema.id).notNull(),
	key_id: integer('key_id').notNull(),
	pub_key: bytea('pub_key').notNull(),
});

export const {password: _, ...userColumnsSanitized} = getTableColumns(usersSchema);
