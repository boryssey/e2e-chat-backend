import {getTableColumns, sql} from 'drizzle-orm';
import {
	uuid,
	jsonb,
	customType,
	integer,
	pgTable, serial, text, timestamp,
} from 'drizzle-orm/pg-core';

const bytea = customType<{data: ArrayBuffer; notNull: false; default: false}>({
	dataType() {
		return 'bytea';
	},
});

export const usersSchema = pgTable('users', {
	id: serial('id').unique().primaryKey(),
	username: text('username').notNull(),
	password: text('password'),
	created_at: timestamp('created_at').defaultNow(),
});

export type User = typeof usersSchema.$inferSelect;

export const {password: _, ...userColumnsSanitized} = getTableColumns(usersSchema);

export const keyBundleSchema = pgTable('key_bundles', {
	id: serial('id').unique().primaryKey(),
	user_id: integer('user_id').references(() => usersSchema.id).notNull(),
	identity_pub_key: bytea('identity_pub_key').notNull(),
	signed_pre_key_id: integer('signed_pre_key').notNull(),
	signed_pre_key_signature: bytea('signed_pre_key_signature').notNull(),
	signed_pre_key_pub_key: bytea('signed_pre_key_pub_key').notNull(),
	created_at: timestamp('created_at').defaultNow(),
	registration_id: integer('registration_id').notNull(),
});

export type KeyBundle = typeof keyBundleSchema.$inferSelect;

export const oneTimeKeysSchema = pgTable('one_time_keys', {
	id: serial('id').unique().primaryKey(),
	key_bundle_id: integer('key_bundle_id').references(() => keyBundleSchema.id).notNull(),
	key_id: integer('key_id').notNull().unique(),
	pub_key: bytea('pub_key').notNull(),
});

export const messageSchema = pgTable('messages', {
	id: serial('id').unique().primaryKey(),
	from_user_id: integer('from_user_id').references(() => usersSchema.id).notNull(),
	to_user_id: integer('to_user_id').references(() => usersSchema.id).notNull(),
	message: jsonb('message').notNull(),
	timestamp: timestamp('timestamp').notNull(),
});
export type Message = typeof messageSchema.$inferSelect;

export const disposableChatSchema = pgTable('disposable_chats', {
	id: uuid('id').default(sql`uuid_generate_v4()`).unique().primaryKey(),
	user1: integer('user1_id').references(() => usersSchema.id),
	user2: integer('user2_id').references(() => usersSchema.id),
	created_at: timestamp('created_at').defaultNow(),
});

export type DisposableChat = typeof disposableChatSchema.$inferSelect;

export const disposableChatColumns = getTableColumns(disposableChatSchema);

