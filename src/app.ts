import {join} from 'node:path';
import AutoLoad from '@fastify/autoload';
import {
	type FastifyPluginAsync,
} from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import fastifyAuth from '@fastify/auth';
import cors from '@fastify/cors';
import fastifyIO from 'fastify-socket.io';
import {type AppOptions} from './utils/types';
import {verifyJwtCookie} from './utils/decorators';
import {keyBundleSchema, oneTimeKeysSchema, type User} from './schema';
import {findUserByUsername} from './services/user.service';
import {
	deleteReceivedMessages, getStoredMessagesByUser, groupStoredMessagesBySender, storeMessage,
} from './services/message.service';
import {validateMessageReceivedRequest, validateSendMessageRequest} from './dtos/socketEvents.dto';

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};
process.env.DEBUG = 'engine,socket.io*';

const corsOptions = process.env.NODE_ENV === 'production' ? {
	origin: ['https://chate2e.com'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPGRADE'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
} : {
	origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPGRADE'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
};

const app: FastifyPluginAsync<AppOptions> = async (
	fastify,
	options_,
): Promise<void> => {
	await fastify.register(cors, corsOptions);
	await fastify.register(fastifyCookie);
	await fastify.register(fastifyJWT, {
		secret: process.env.JWT_SECRET!,
	});

	await fastify.register(fastifyIO, {
		cors: corsOptions,
		allowRequest(request, callback) {
			if (!request.headers.cookie) {
				callback(null, false);
				return;
			}

			const cookies = fastifyCookie.parse(request.headers.cookie);
			if (!cookies.accessToken) {
				callback(null, false);
				return;
			}

			const user = fastify.jwt.decode<Omit<User, 'password'>>(cookies.accessToken);
			request.session = user!;
			callback(null, true);
		},

	});

	fastify.addHook('preHandler', (request, _reply, done) => {
		request.jwt = fastify.jwt;
		request.fastify = fastify;
		done();
	});

	fastify.decorate('verifyJwtCookie', verifyJwtCookie);
	fastify.ready().then(() => {
		fastify.io.on('connection', async socket => {
			// get messages for the user
			// emit stored messages

			// socket.user = socket.handshake.session;
			socket.data.user = socket.request.session!;

			socket.on('keyBundle:save', async (data, callback) => {
				// TODO: only one key bundle at a time
				try {
					const keyBundle = {
						user_id: socket.data.user.id,
						identity_pub_key: data.identityPubKey,
						signed_pre_key_id: data.signedPreKey.keyId,
						signed_pre_key_signature: data.signedPreKey.signature,
						signed_pre_key_pub_key: data.signedPreKey.publicKey,
						registration_id: data.registrationId,
					};
					await fastify.drizzle.transaction(async tx => {
						const [newKeyBundle] = await tx.insert(keyBundleSchema).values({...keyBundle}).returning();
						const newOneTimeKey = await tx.insert(oneTimeKeysSchema).values({
							key_bundle_id: newKeyBundle.id,
							key_id: data.oneTimePreKeys[0].keyId,
							pub_key: data.oneTimePreKeys[0].publicKey,
						}).returning();
						return {
							keyBundle: newKeyBundle,
							oneTimeKey: newOneTimeKey,
						};
					});
					await callback();
				} catch (error) {
					console.error('Error while saving key bundle', error);
				}
			});
			socket.on('message:send', async (data, callback) => {
				const isMessageValid = validateSendMessageRequest(data);
				if (!isMessageValid) {
					// callback({error: 'Invalid message'});
					await callback();

					return;
				}

				const [recipient] = await findUserByUsername(fastify.drizzle, data.to);
				if (!recipient) {
					console.log('recipient not found');
					// callback({error: 'Recipient not found'});
					await callback();

					return;
				}

				const [savedMessage] = await storeMessage(fastify.drizzle, {
					from_user_id: socket.data.user.id,
					to_user_id: recipient.id,
					message: data.message,
					timestamp: new Date(data.timestamp),
				});

				const sockets = await fastify.io.fetchSockets();
				const recipientSocketId = sockets.find(socket => socket.data.user.username === data.to);
				if (recipientSocketId) {
					recipientSocketId.emit('message:receive', {from_user_username: socket.data.user.username, ...savedMessage});
					await callback();

					return;
				}

				await callback();
			});
			socket.on('message:ack', async (data, callback) => {
				const isEventValid = validateMessageReceivedRequest(data);
				if (!isEventValid) {
					return;
				}

				await deleteReceivedMessages(fastify.drizzle, socket.data.user.id, data.lastReceivedMessageId);
				// delete messages from db where id < data.id and to_user_id = socket.user.id
				await callback();
			});
			try {
				const savedMessagesForUser = groupStoredMessagesBySender(await getStoredMessagesByUser(fastify.drizzle, socket.data.user.id));
				socket.emit('messages:stored', savedMessagesForUser);
			} catch (error) {
				console.error(error);
			}
		},
		);
	}, () => {
		console.log('ready error');
	});
	await fastify.register(fastifyAuth, {defaultRelation: 'and'});
	await fastify.register(AutoLoad, {
		dir: join(__dirname, 'plugins'),
		options: options_,
	});

	await fastify.register(AutoLoad, {
		dir: join(__dirname, 'routes'),
		options: options_,
	});
};

export default app;
export {app, options};

