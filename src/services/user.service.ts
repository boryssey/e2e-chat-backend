import {eq} from 'drizzle-orm';
import {
	keyBundleSchema, oneTimeKeysSchema, userColumnsSanitized, usersSchema,
} from '../schema';
import {type DrizzleType} from '../plugins/drizzleOrm';

export const findUserByUsername = async (drizzle: DrizzleType, username: string) => drizzle.select().from(usersSchema).where(eq(usersSchema.username, username)).limit(1);

export const findUserById = async (drizzle: DrizzleType, id: number) => drizzle.select({
	...userColumnsSanitized,
}).from(usersSchema).where(eq(usersSchema.id, id)).limit(1);

export const createUser = async (drizzle: DrizzleType, newuser: {username: string; password: string}) => drizzle.insert(usersSchema).values({...newuser}).returning({
	...userColumnsSanitized,
});

export const getKeyBundleByUsername = async (drizzle: DrizzleType, username: string) => {
	const [user] = await drizzle.select().from(usersSchema).where(eq(usersSchema.username, username));
	const [keyBundle] = await drizzle.select().from(keyBundleSchema).where(eq(keyBundleSchema.user_id, user.id)).leftJoin(oneTimeKeysSchema, eq(oneTimeKeysSchema.key_bundle_id, keyBundleSchema.id));
	return keyBundle;
};
export const getKeyBundleByUserId = async (drizzle: DrizzleType, userId: number) => {
	const keyBundle = await drizzle.select().from(keyBundleSchema).where(eq(keyBundleSchema.user_id, userId));
	return keyBundle[0];
};
