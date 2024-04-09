import {type RouteShorthandOptionsWithHandler} from 'fastify';
import {type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {userAuthRequestDTO} from '../dtos/auth.dto';
import {loginController, registerController} from '../controllers/auth.controller';

export const loginOptions = {
	schema: {
		body: userAuthRequestDTO,
	},
};

export const registerOptions = {
	schema: {
		body: userAuthRequestDTO,
	},
};

const logoutOptions: RouteShorthandOptionsWithHandler = {
	async handler(request, _reply) {
		console.log(request.cookies.access_token, 'cookies');
		return 'test';
	},
};

const authRoutes: FastifyPluginAsyncTypebox = async (fastify, _options): Promise<void> => {
	fastify.post('/register', registerOptions, registerController);
	fastify.post('/login', loginOptions, loginController);
	fastify.get('/logout', {
		preHandler: fastify.auth([fastify.verifyJwtCookie]),
		...logoutOptions,
	});
	fastify.get('/me', {
		preHandler: fastify.auth([fastify.verifyJwtCookie]),
		async handler(request, _reply) {
			return request.user;
		},
	});
};

export const autoPrefix = '/auth';

export default authRoutes;
