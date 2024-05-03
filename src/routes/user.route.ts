import {type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {getKeyBundleRequestDTO} from '../dtos/user.dto';
import {getUserKeyBundleController} from '../controllers/user.controller';

export const getKeyBundleOptions = {
	schema: {
		params: getKeyBundleRequestDTO,
	},
};

const UserRoutes: FastifyPluginAsyncTypebox = async (fastify, _options): Promise<void> => {
	fastify.get('/:username/keyBundle:', getKeyBundleOptions, getUserKeyBundleController);
};

export const autoPrefix = '/user';

export default UserRoutes;
