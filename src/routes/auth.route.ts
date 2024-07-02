import {type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {loginRequestDTO, userAuthRequestDTO} from '../dtos/auth.dto';
import {
	loginController, logoutController, meController, registerController,
} from '../controllers/auth.controller';

export const loginOptions = {
	schema: {
		body: loginRequestDTO,
	},
};

export const registerOptions = {
	schema: {
		body: userAuthRequestDTO,
	},
};

const authRoutes: FastifyPluginAsyncTypebox = async (fastify, _options): Promise<void> => {
	fastify.post('/register', registerOptions, registerController);
	fastify.post('/login', loginOptions, loginController);
	fastify.get('/logout', {preHandler: fastify.auth([fastify.verifyJwtCookie])}, logoutController);
	fastify.get('/me', {
		preHandler: fastify.auth([fastify.verifyJwtCookie]),
	}, meController);
};

export const autoPrefix = '/auth';

export default authRoutes;
