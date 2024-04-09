import {join} from 'node:path';
import AutoLoad from '@fastify/autoload';
import {
	type FastifyPluginAsync,
} from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import fastifyAuth from '@fastify/auth';
import {type AppOptions} from './utils/types';
import {verifyJwtCookie} from './utils/decorators';
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
	fastify,
	options_,
): Promise<void> => {
	await fastify.register(fastifyCookie);
	await fastify.register(fastifyJWT, {
		secret: process.env.JWT_SECRET!,
	});

	fastify.addHook('preHandler', (request, _reply, done) => {
		request.jwt = fastify.jwt;
		done();
	});
	fastify.addHook('onRequest', async request => {
		request.fastify = fastify;
	});

	fastify.decorate('verifyJwtCookie', verifyJwtCookie);

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

