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

const savedKeyBundles: Record<string, any> = {};

const app: FastifyPluginAsync<AppOptions> = async (
	fastify,
	options_,
): Promise<void> => {
	await fastify.register(cors, {
		origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPGRADE'],
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization'],
	});
	await fastify.register(fastifyCookie);
	await fastify.register(fastifyJWT, {
		secret: process.env.JWT_SECRET!,
	});

	await fastify.register(fastifyIO, {
		cors: {

			origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPGRADE'],
			credentials: true,
			allowedHeaders: ['Content-Type', 'Authorization'],
		},
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
		console.log('ready');
		fastify.io.on('connection', async socket => {
			// get messages for the user
			// emit stored messages

			console.log(socket.request.session, 'session data');
			// socket.user = socket.handshake.session;
			socket.data.user = socket.request.session!;
			try {
				const savedMessagesForUser = groupStoredMessagesBySender(await getStoredMessagesByUser(fastify.drizzle, socket.data.user.id));
				console.log('🚀 ~ fastify.ready ~ savedMessagesForUser:', savedMessagesForUser);
				socket.emit('messages:stored', savedMessagesForUser);
			} catch (error) {
				console.error(error);
			}

			console.log('connected');
			socket.emit('hello', {hello: 'world'});
			socket.on('keyBundle:save', async (data: any) => {
				console.log('saveKeyBundle', data);
				// savedKeyBundles[socket.username!] = socket.keyBundle;
				const keyBundle = {
					user_id: socket.data.user.id,
					identity_pub_key: data.keyBundle.identityPubKey as ArrayBuffer,
					signed_pre_key_id: data.keyBundle.signedPreKey.keyId as number,
					signed_pre_key_signature: data.keyBundle.signedPreKey.signature as ArrayBuffer,
					signed_pre_key_pub_key: data.keyBundle.signedPreKey.publicKey as ArrayBuffer,
					registration_id: data.keyBundle.registrationId as number,
				};
				const saveBundleResult = await fastify.drizzle.transaction(async tx => {
					const [newKeyBundle] = await tx.insert(keyBundleSchema).values({...keyBundle}).returning();
					const newOneTimeKey = await tx.insert(oneTimeKeysSchema).values({
						key_bundle_id: newKeyBundle.id,
						key_id: data.keyBundle.oneTimePreKeys[0].keyId as number,
						pub_key: data.keyBundle.oneTimePreKeys[0].publicKey as ArrayBuffer,
					}).returning();
					return {
						keyBundle: newKeyBundle,
						oneTimeKey: newOneTimeKey,
					};
				});
				console.log(saveBundleResult, 'transaction result');
			});
			socket.on('message:send', async (data: any, callback: (data: any) => void) => {
				const isMessageValid = validateSendMessageRequest(data);
				if (!isMessageValid) {
					callback({error: 'Invalid message'});
					return;
				}

				const [recipient] = await findUserByUsername(fastify.drizzle, data.to);
				if (!recipient) {
					console.log('recipient not found');
					callback({error: 'Recipient not found'});
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
					return;
				}

				console.log(recipient, 'recipiasync ent');
			});
			socket.on('message:ack', async (data: any) => {
				console.log('message:ack', data);
				const isEventValid = validateMessageReceivedRequest(data);
				if (!isEventValid) {
					return;
				}

				await deleteReceivedMessages(fastify.drizzle, socket.data.user.id, data.lastReceivedMessageId);
				// delete messages from db where id < data.id and to_user_id = socket.user.id
			});
		},
		);
	}, () => {
		console.log('ready error');
	});
	await fastify.register(fastifyAuth, {defaultRelation: 'and'});
	await fastify.register(AutoLoad, {
		dir: join(__dirname, 'plugins'),
		options: {
			dirNameRoutePrefix(folderParent: string, folderName: string) {
				console.log({folderParent, folderName});
				return false;
			},
		},
	});

	await fastify.register(AutoLoad, {
		dir: join(__dirname, 'routes'),
		options: options_,
	});
};

export default app;
export {app, options};

