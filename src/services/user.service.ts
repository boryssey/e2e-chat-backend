import {eq} from 'drizzle-orm';
import {usersSchema} from '../schema';
import {type DrizzleType} from '../plugins/drizzleOrm';

export const findUserByUsername = async (drizzle: DrizzleType, username: string) => drizzle.select().from(usersSchema).where(eq(usersSchema.username, username)).limit(1);

export const createUser = async (drizzle: DrizzleType, newuser: {username: string; password: string}) => drizzle.insert(usersSchema).values({...newuser}).returning();
