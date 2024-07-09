import {type FastifyRequest} from 'fastify';
import {type FastifyReplyTypebox, type FastifyRequestTypebox} from '../utils/types';
import {deleteUsedOneTimeKey, getKeyBundleWithOneTimeKeysByUsername} from '../services/user.service';

export const getUserKeyBundleController = async (request: FastifyRequest & FastifyRequestTypebox<Record<string, unknown>>, reply: FastifyReplyTypebox<Record<string, unknown>>) => {
	try {
		const {username} = request.params as {username: string};
		if (!username || typeof username !== 'string') {
			return await reply.status(400).send({message: 'Username is required'});
		}

		const keyBundle = await getKeyBundleWithOneTimeKeysByUsername(request.fastify.drizzle, username);
		if (!keyBundle) {
			return await reply.status(404).send({message: 'Key bundle not found'});
		}

		if (keyBundle.one_time_keys) {
			await deleteUsedOneTimeKey(request.fastify.drizzle, keyBundle.one_time_keys.key_id);
		}

		return await reply.send(keyBundle);
	} catch (error) {
		console.error(error);
		return reply.status(500).send({message: 'Internal server error'});
	}
};
