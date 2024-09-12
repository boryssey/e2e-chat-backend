
import {join} from 'node:path';
import AutoLoad from '@fastify/autoload';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import fastifyAuth from '@fastify/auth';
import cors from '@fastify/cors';
import fastifyIO from 'fastify-socket.io';
import {type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {type AppOptions} from './utils/types';
import {verifyJwtCookie} from './utils/decorators';
import {type User} from './schema';
import onConnection from './socket.io';
import {emitSavedMessagesToUser} from './socket.io/keyBundle';

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};
process.env.DEBUG = 'engine,socket.io*';

const corsOptions = process.env.NODE_ENV === 'production' ? {
	origin: ['https://chate2e.com', 'https://www.chate2e.com'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPGRADE'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
} : {
	origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPGRADE'],
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization'],
};

const app: FastifyPluginAsyncTypebox<AppOptions> = async (
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
			onConnection(fastify.io, socket, fastify.drizzle);
			await emitSavedMessagesToUser(socket, fastify.drizzle);
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

