import {eq} from 'drizzle-orm';
import {userColumnsSanitized, usersSchema} from '../schema';
import {type DrizzleType} from '../plugins/drizzleOrm';

export const findUserByUsername = async (drizzle: DrizzleType, username: string) => drizzle.select().from(usersSchema).where(eq(usersSchema.username, username)).limit(1);

export const findUserById = async (drizzle: DrizzleType, id: number) => drizzle.select({
	...userColumnsSanitized,
}).from(usersSchema).where(eq(usersSchema.id, id)).limit(1);

export const createUser = async (drizzle: DrizzleType, newuser: {username: string; password: string}) => drizzle.insert(usersSchema).values({...newuser}).returning({
	...userColumnsSanitized,
});
