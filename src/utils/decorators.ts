import {type FastifyReply, type FastifyRequest, type HookHandlerDoneFunction} from 'fastify';
import {type User} from '../schema';
import {type UserForChat} from './types';

export const verifyJwtCookie = (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
	try {
		const {accessToken} = request.cookies;
		if (!accessToken) {
			void reply.code(401).send({message: 'Unauthorized'});
			done(new Error('Unauthorized'));
			return;
		}

		const user = (request.jwt.verify<Omit<User, 'password'>>(accessToken));
		request.user = user;
		done();
	} catch {
		void reply.code(401).send({message: 'Unauthorized'});
		done(new Error('Unauthorized'));
	}
};

export const verifyChatJwtCookie = (request: FastifyRequest, _reply: FastifyReply, done: HookHandlerDoneFunction) => {
	console.log(request.cookies, 'cookie');
	const chats = Object.entries(request.cookies)
		.filter(([cookieName, jwtToken]) => cookieName.endsWith(':accessToken') && jwtToken)
		.reduce<Record<string, Omit<User, 'password'>>>((accumulator, [_, jwtToken]) => {
		try {
			const userPayload = request.jwt.verify<UserForChat>(jwtToken!);
			return {
				[userPayload.chat_id]: userPayload,
				...accumulator,
			};
		} catch {
			return accumulator;
		}
	}, {});

	request.authorizedChats = chats;
	console.log('🚀 ~ verifyChatJwtCookie ~ request.authorizedChats:', request.authorizedChats);
	done();
};
