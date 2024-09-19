import {deleteKeyBundleWithKeys, findUserByUsername, getKeyBundleByUserId} from '../services/user.service';
import {keyBundleSchema, oneTimeKeysSchema} from '../schema';
import {validateVerifyKeyBundleRequest} from '../dtos/socketEvents.dto';
import {type FastifySocket} from '../utils/types';
import {getStoredMessagesByUser, groupStoredMessagesBySender} from '../services/message.service';
import {type DrizzleType} from '../plugins/drizzleOrm';
import {eventHandler, type EventHandlerRegisterer} from '.';

const registerKeyBundleHandlers: EventHandlerRegisterer = async (io, socket, drizzle) => {
	const handleSaveKeyBundle = eventHandler<'keyBundle:save'>(async data => {
		const existingKeyBundle = await getKeyBundleByUserId(drizzle, socket.data.user.id);
		if (existingKeyBundle) {
			await deleteKeyBundleWithKeys(drizzle, existingKeyBundle.id);
		}

		const keyBundle = {
			user_id: socket.data.user.id,
			identity_pub_key: data.identityPubKey,
			signed_pre_key_id: data.signedPreKey.keyId,
			signed_pre_key_signature: data.signedPreKey.signature,
			signed_pre_key_pub_key: data.signedPreKey.publicKey,
			registration_id: data.registrationId,
		};
		await drizzle.transaction(async tx => {
			try {
				const newKeyBundle = await tx.insert(keyBundleSchema).values({...keyBundle}).returning();
				if (!newKeyBundle[0]) {
					throw new Error('Error while saving key bundle');
				}

				const oneTimeKeys = data.oneTimePreKeys.map(oneTimeKey => ({
					key_bundle_id: newKeyBundle[0].id,
					key_id: oneTimeKey.keyId,
					pub_key: oneTimeKey.publicKey,
				}));
				const newOneTimeKeys = await tx.insert(oneTimeKeysSchema).values(oneTimeKeys).returning();
				return {
					keyBundle: newKeyBundle,
					oneTimeKeys: newOneTimeKeys,
				};
			} catch (error) {
				console.error(error);

				tx.rollback();
				throw error;
			}
		});
		return {
			success: true,
		};
	});

	const handleVerifyKeyBundle = eventHandler<'keyBundle:verify'>(async data => {
		const isRequestValid = validateVerifyKeyBundleRequest(data);
		if (!isRequestValid) {
			return {
				success: true,
				value: {verified: false},
			};
		}

		const [user] = await findUserByUsername(drizzle, data.username);
		if (!user) {
			return {
				success: true,
				value: {verified: false},
			};
		}

		const keyBundle = await getKeyBundleByUserId(drizzle, user.id);

		// eslint-disable-next-line @typescript-eslint/ban-types
		const isVerified = (data.identityPubKey as Buffer).equals(keyBundle.identity_pub_key as Buffer);

		return {
			success: true,
			value: {verified: isVerified},
		};
	});

	socket.on('keyBundle:save', handleSaveKeyBundle);
	socket.on('keyBundle:verify', handleVerifyKeyBundle);
};

export const emitSavedMessagesToUser = async (socket: FastifySocket, drizzle: DrizzleType) => {
	try {
		const savedMessagesForUser = groupStoredMessagesBySender(await getStoredMessagesByUser(drizzle, socket.data.user.id));
		socket.emit('messages:stored', savedMessagesForUser);
	} catch {
		console.error('Could not retrieve messages for user:', socket.data.user.id);
	}
};

export default registerKeyBundleHandlers;
