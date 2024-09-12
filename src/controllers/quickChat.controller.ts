import id from 'uuid-readable';
import {type FastifyReplyTypebox, type FastifyRequestTypebox} from '../utils/types';
import {type CreateUserForQuickChatType, type CreateChatSchemaType, type GetChatInfoType} from '../routes/quickChat.route';
import {createQuickChat, getQuickChatInfo, setUserForChat} from '../services/quickChat.service';
import {createUser} from '../services/user.service';
import {cookieOptions} from './auth.controller';

export const postQuickChatController = async (request: FastifyRequestTypebox<CreateChatSchemaType>, reply: FastifyReplyTypebox<CreateChatSchemaType>) => {
	const [createdChat] = await createQuickChat(request.fastify.drizzle);
	if (!createdChat) {
		await reply.status(500).send({message: 'Something went wrong when creating new disposable chat'});
		return;
	}

	await reply.status(201).send();
};

export const getQuickChatInfoController = async (request: FastifyRequestTypebox<GetChatInfoType>, reply: FastifyReplyTypebox<GetChatInfoType>) => {
	const {uuid} = request.params;
	const [chatInfo] = await getQuickChatInfo(request.fastify.drizzle, uuid);
	if (!chatInfo) {
		return reply.status(404).send();
	}

	if (chatInfo.user1 && chatInfo.user2 && !request.authorizedChats[uuid]) {
		return reply.status(401).send();
	}

	return reply.status(200).send(chatInfo);
};

export const createUserForChatController = async (request: FastifyRequestTypebox<CreateUserForQuickChatType>, reply: FastifyReplyTypebox<CreateUserForQuickChatType>) => {
	const {drizzle} = request.fastify;
	const {uuid: chat_id} = request.params;
	const [chat] = await getQuickChatInfo(drizzle, chat_id);

	if (!chat) {
		return reply.status(404).send();
	}

	if (chat.user1 && chat.user2) {
		return reply.status(401).send({message: 'All user slots for this chat are already taken'});
	}

	const newUsername = id.generate().replaceAll(' ', '-');
	const [newUser] = await createUser(drizzle, {username: newUsername});

	await setUserForChat(drizzle, chat_id, {
		[chat.user1 ? 'user2' : 'user1']: newUser.id,
	} as Record<'user1' | 'user2', number>);

	const newJwt = request.jwt.sign({...newUser, chat_id});
	void reply.setCookie(`${chat_id}:accessToken`, newJwt, cookieOptions);

	return reply.status(201).send({
		id: newUser.id,
		username: newUser.username,
	});
};
