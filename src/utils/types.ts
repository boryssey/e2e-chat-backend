import {type AutoloadPluginOptions} from '@fastify/autoload';
import {type JWT} from '@fastify/jwt';
import {type TypeBoxTypeProvider} from '@fastify/type-provider-typebox';
import {
	type ContextConfigDefault, type RawReplyDefaultExpression, type RawRequestDefaultExpression, type RawServerDefault, type RouteGenericInterface, type FastifyServerOptions, type HookHandlerDoneFunction,
	type FastifySchema,
	type FastifyReply,
	type FastifyRequest,
} from 'fastify';
import {type Server} from 'socket.io';
import {type User} from '../schema';

export type FastifyRequestTypebox<TSchema extends FastifySchema> = FastifyRequest<
RouteGenericInterface,
RawServerDefault,
RawRequestDefaultExpression,
TSchema,
TypeBoxTypeProvider
>;

export type FastifyReplyTypebox<TSchema extends FastifySchema> = FastifyReply<
RawServerDefault,
RawRequestDefaultExpression,
RawReplyDefaultExpression,
RouteGenericInterface,
ContextConfigDefault,
TSchema,
TypeBoxTypeProvider
>;

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: {id: number}; // payload type is used for signing and verifying
		user: Omit<User, 'password'>; // user type is used for request.user
	}
}

declare module 'fastify' {
	interface FastifyRequest {
		fastify: FastifyInstance;
		jwt: JWT;
	}
	export interface FastifyInstance {
		verifyJwtCookie: (
			request: FastifyRequest,
			reply: FastifyReply,
			done: HookHandlerDoneFunction
		) => void;
		io: Server<any, any, any, {user: Omit<User, 'password'>}>;

	}
}

declare module 'http' {
	interface IncomingMessage {
		session?: Omit<User, 'password'>;
	}
}
export type AppOptions = Record<string, unknown> & FastifyServerOptions & Partial<AutoloadPluginOptions>;
