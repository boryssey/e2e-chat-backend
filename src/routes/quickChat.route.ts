import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {getQuickChatInfoResponseDTO, postQuickChatResponseDTO} from '../dtos/quickChat.dto';
import {createUserForChatController, getQuickChatInfoController, postQuickChatController} from '../controllers/quickChat.controller';

export const createChatSchema = {
	response: {
		201: postQuickChatResponseDTO,
		500: Type.Object({
			message: Type.String(),
		}),
	},
};

export type CreateChatSchemaType = typeof createChatSchema;

export const getChatInfoSchema = {
	params: Type.Object({
		uuid: Type.String(),
	}),
	response: {
		200: getQuickChatInfoResponseDTO,
	},
};

export type GetChatInfoType = typeof getChatInfoSchema;

export const createUserForQuickChatSchema = {
	params: Type.Object({
		uuid: Type.String(),
	}),
	response: {
		200: Type.Object({
			username: Type.String(),
		}),
		401: Type.Object({
			message: Type.String(),
		}),
	},
};

export type CreateUserForQuickChatType = typeof createUserForQuickChatSchema;

const quickChatRoutes: FastifyPluginAsyncTypebox = async (fastify, _options): Promise<void> => {
	fastify.post('/', {schema: createChatSchema}, postQuickChatController);
	fastify.get('/:uuid', {schema: getChatInfoSchema}, getQuickChatInfoController);
	fastify.post('/:uuid/user', {schema: createUserForQuickChatSchema}, createUserForChatController);
};

export const autoPrefix = '/quick-chats';

export default quickChatRoutes;
