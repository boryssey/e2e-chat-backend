import {type FastifyPluginAsync} from 'fastify';

const healthCheckRoutes: FastifyPluginAsync = async (fastify, _options): Promise<void> => {
	fastify.get('/', () => ({
		message: 'OK',
		uptime: process.uptime(),
		timestamp: Date.now(),
		date: (new Date()).toUTCString(),
	}));
};

export const autoPrefix = '/health';

export default healthCheckRoutes;
