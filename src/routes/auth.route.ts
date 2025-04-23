import {type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {loginRequestDTO, loginResponseDTO, userAuthRequestDTO} from '../dtos/auth.dto';
import {
	loginController, logoutController, meController, registerController,
} from '../controllers/auth.controller';

export const loginOptions = {
	schema: {
		body: loginRequestDTO,
		response: {
			200: loginResponseDTO,
		},
	},
};

export const meOptions = {
	schema: {
		response: {
			200: loginResponseDTO,
			401: null,
		},
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
		...meOptions,
		preHandler: fastify.auth([fastify.verifyJwtCookie]),
	}, meController);
};

export const autoPrefix = '/auth';

export default authRoutes;
