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

export const getKeyBundleWithOneTimeKeysByUsername = async (drizzle: DrizzleType, username: string) => {
	const [user] = await drizzle.select().from(usersSchema).where(eq(usersSchema.username, username));
	const keyBundle = await drizzle.select().from(keyBundleSchema).where(eq(keyBundleSchema.user_id, user.id)).leftJoin(oneTimeKeysSchema, eq(oneTimeKeysSchema.key_bundle_id, keyBundleSchema.id)).limit(1);
	return keyBundle[0];
};

export const deleteUsedOneTimeKey = async (drizzle: DrizzleType, keyId: number) => drizzle.delete(oneTimeKeysSchema).where(eq(oneTimeKeysSchema.key_id, keyId));

export const getKeyBundleByUserId = async (drizzle: DrizzleType, userId: number) => {
	const keyBundle = await drizzle.select().from(keyBundleSchema).where(eq(keyBundleSchema.user_id, userId));
	return keyBundle[0];
};

export const deleteKeyBundleWithKeys = async (drizzle: DrizzleType, keyBundleId: number) => drizzle.transaction(async tx => {
	await tx.delete(oneTimeKeysSchema).where(eq(oneTimeKeysSchema.key_bundle_id, keyBundleId));
	await tx.delete(keyBundleSchema).where(eq(keyBundleSchema.id, keyBundleId));
});
