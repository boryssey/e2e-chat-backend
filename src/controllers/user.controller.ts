import {type FastifyRequest} from 'fastify';
import {type FastifyReplyTypebox, type FastifyRequestTypebox} from '../utils/types';
import {getKeyBundleByUsername} from '../services/user.service';

export const getUserKeyBundleController = async (request: FastifyRequest & FastifyRequestTypebox<Record<string, unknown>>, reply: FastifyReplyTypebox<Record<string, unknown>>) => {
	try {
		const {username} = request.params as {username: string};
		if (!username || typeof username !== 'string') {
			return await reply.status(400).send({message: 'Username is required'});
		}

		const keyBundle = await getKeyBundleByUsername(request.fastify.drizzle, username);

		return await reply.send(keyBundle);
	} catch (error) {
		console.error(error);
		return reply.status(500).send({message: 'Internal server error'});
	}
};
