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

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
	fastify,
	options_,
): Promise<void> => {
	await fastify.register(cors, {
		origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization'],
	});
	await fastify.register(fastifyCookie);
	await fastify.register(fastifyJWT, {
		secret: process.env.JWT_SECRET!,
	});

	await fastify.register(fastifyIO);

	fastify.addHook('preHandler', (request, _reply, done) => {
		request.jwt = fastify.jwt;
		request.fastify = fastify;
		done();
	});

	fastify.decorate('verifyJwtCookie', verifyJwtCookie);
	fastify.ready().then(() => {
		console.log('ready');
		fastify.io.on('connection', socket => {
			console.log('connected');
			socket.emit('hello', {hello: 'world'});
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

