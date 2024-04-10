import {getTableColumns} from 'drizzle-orm';
import {
	pgTable, serial, text, timestamp,
} from 'drizzle-orm/pg-core';

export const usersSchema = pgTable('users', {
	id: serial('id'),
	username: text('username').notNull(),
	password: text('password').notNull(),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	deleted_at: timestamp('deleted_at'),
});

export type User = typeof usersSchema.$inferSelect;

export const {password: _, ...userColumnsSanitized} = getTableColumns(usersSchema);
