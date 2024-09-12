import {eq} from 'drizzle-orm';
import {alias} from 'drizzle-orm/pg-core';
import {type DrizzleType} from '../plugins/drizzleOrm';
import {disposableChatColumns, disposableChatSchema, usersSchema} from '../schema';

export const createQuickChat = async (drizzle: DrizzleType) => drizzle.insert(disposableChatSchema).values({}).returning({
	chat_id: disposableChatColumns.id,
});

export const getQuickChatInfo = async (drizzle: DrizzleType, chat_id: string) => {
	const user2Alias = alias(usersSchema, 'user2');

	return drizzle
		.select({
			id: disposableChatSchema.id,
			user1: usersSchema.username,
			user2: user2Alias.username,
		})
		.from(disposableChatSchema)
		.where(eq(disposableChatSchema.id, chat_id))
		.leftJoin(usersSchema, eq(usersSchema.id, disposableChatSchema.user1))
		.leftJoin(user2Alias, eq(user2Alias.id, disposableChatSchema.user2));
};

export const setUserForChat = async (drizzle: DrizzleType, chat_id: string, newUser: Record<'user1' | 'user2', number>) => drizzle.update(disposableChatSchema).set(newUser);
