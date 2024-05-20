import {
	and, eq, getTableColumns, lte,
} from 'drizzle-orm';
import {type DrizzleType} from '../plugins/drizzleOrm';
import {messageSchema, usersSchema} from '../schema';
import {groupBy} from '../utils/helpers';

export const storeMessage = async (drizzle: DrizzleType, message: typeof messageSchema.$inferInsert) => drizzle
	.insert(messageSchema)
	.values({...message})
	.returning();

export const getStoredMessagesByUser = async (drizzle: DrizzleType, userId: number) => drizzle
	.select({
		// from_user_username: usersSchema.username,
		from_user_user_id: usersSchema.id,
		from_user_username: usersSchema.username,
		message: {...getTableColumns(messageSchema)},

	})
	.from(messageSchema)
	.where(eq(messageSchema.to_user_id, userId))
	.innerJoin(usersSchema, eq(usersSchema.id, messageSchema.from_user_id));

export const groupStoredMessagesBySender = (data: Awaited<ReturnType<typeof getStoredMessagesByUser>>) => groupBy(data, ({from_user_username}) => from_user_username);

export const deleteReceivedMessages = async (drizzle: DrizzleType, userId: number, lastReceivedId: number) => drizzle
	.delete(messageSchema)
	.where(and(eq(messageSchema.to_user_id, userId), lte(messageSchema.id, lastReceivedId)));
