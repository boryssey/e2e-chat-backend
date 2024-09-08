
import {type AutoloadPluginOptions} from '@fastify/autoload';
import {type JWT} from '@fastify/jwt';
import {type TypeBoxTypeProvider} from '@fastify/type-provider-typebox';
import {
	type ContextConfigDefault, type RawReplyDefaultExpression, type RawRequestDefaultExpression, type RawServerDefault, type RouteGenericInterface, type FastifyServerOptions, type HookHandlerDoneFunction,
	type FastifySchema,
	type FastifyReply,
	type FastifyRequest,
} from 'fastify';
import {type Socket, type Server} from 'socket.io';
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

export interface MessageType {
	type: number;
	body?: string;
	registrationId?: number;
}

export interface KeyPairType<T = ArrayBuffer> {
	pubKey: T;
	privKey: T;
}
export interface PreKeyPairType<T = ArrayBuffer> {
	keyId: number;
	keyPair: KeyPairType<T>;
}
export interface SignedPreKeyPairType<T = ArrayBuffer> extends PreKeyPairType<T> {
	signature: T;
}
export interface PreKeyType<T = ArrayBuffer> {
	keyId: number;
	publicKey: T;
}
export interface SignedPublicPreKeyType<T = ArrayBuffer> extends PreKeyType<T> {
	signature: T;
}

type Result<Error, Value> =
 | {
 	success: false;
 	error: Error;
 }
 | {
 	success: true;
 	value?: Value;
 };

export type CallbackWithError<Value> = (data: Result<Error, Value>) => void;

export type ClientToServerEvents = {
	'message:send': (data: {
		to: string;
		message: MessageType;
		timestamp: number;
	// }, callback: () => void | Promise<void>) => void | Promise<void>;
	}, callback: CallbackWithError<Record<string, any>>) => void;
	'message:ack': (data: {
		lastReceivedMessageId: number;
	}, callback: CallbackWithError<Record<string, any>>) => void;
	'keyBundle:save': (data: {
		registrationId: number;
		identityPubKey: ArrayBuffer;
		signedPreKey: SignedPublicPreKeyType;
		oneTimePreKeys: PreKeyType[];
	}, callback: CallbackWithError<Record<string, any>>) => void;
	'keyBundle:verify': (
		data: {
			identityPubKey: ArrayBuffer;
			username: string;
		},
		callback: CallbackWithError<{verified?: boolean}>
	) => void;
};

export interface ServerToClientEvents {
	'messages:stored': (
		data: Record<
		string,
		Array<{
			from_user_user_id: number;
			from_user_username: string;
			message: {
				id: number;
				from_user_id: number;
				to_user_id: number;
				message: unknown;
				timestamp: number;
			};
		}>
		>
	) => void;

	'message:receive': (data: {
		id: number;
		message: MessageType;
		from_user_id: number;
		from_user_username: string;
		to_user_id: number;
		timestamp: number;
	}) => void | Promise<void>;

	hello: (data: {hello: 'world'}) => void ;
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
		io: Server<ClientToServerEvents, any, any, {user: Omit<User, 'password'>}>;
	}
}

export type FastifySocket = Socket<ClientToServerEvents, any, any, {user: Omit<User, 'password'>}>;

declare module 'http' {
	interface IncomingMessage {
		session?: Omit<User, 'password'>;
	}
}
export type AppOptions = Record<string, unknown> & FastifyServerOptions & Partial<AutoloadPluginOptions>;
