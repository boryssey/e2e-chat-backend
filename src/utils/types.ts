/* eslint-disable unicorn/prevent-abbreviations */

import {type TypeBoxTypeProvider} from '@fastify/type-provider-typebox';
import {
	type ContextConfigDefault, type RawReplyDefaultExpression, type RawRequestDefaultExpression, type RawServerDefault, type RouteGenericInterface, type HookHandlerDoneFunction,
	type FastifySchema,
	type FastifyReply,
	type FastifyRequest,
	type FastifyInstance,
	type FastifyBaseLogger,
	type FastifyServerOptions,
} from 'fastify';
import {type Socket, type Server} from 'socket.io';
import {type JWT} from '@fastify/jwt';
import {type AutoloadPluginOptions} from '@fastify/autoload';
import {type User} from '../schema';

export type FastifyRequestTypebox<TSchema extends FastifySchema> = FastifyRequest<
RouteGenericInterface,
RawServerDefault,
RawRequestDefaultExpression,
TSchema,
TypeBoxTypeProvider
>;

type FastifyTypebox = FastifyInstance<
RawServerDefault,
RawRequestDefaultExpression,
RawReplyDefaultExpression,
FastifyBaseLogger,
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

export type EventsMap = Record<string, any>;
export declare type EventNames<Map extends EventsMap> = keyof Map & (string | symbol);
export declare type ReservedOrUserEventNames<ReservedEventsMap extends EventsMap, UserEvents extends EventsMap> = EventNames<ReservedEventsMap> | EventNames<UserEvents>;
declare type FallbackToUntypedListener<T> = [T] extends [never] ? never : T;
export declare type ReservedOrUserListener<ReservedEvents extends EventsMap, UserEvents extends EventsMap, Event_ extends ReservedOrUserEventNames<ReservedEvents, UserEvents>> = FallbackToUntypedListener<Event_ extends EventNames<ReservedEvents> ? ReservedEvents[Event_] : Event_ extends EventNames<UserEvents> ? UserEvents[Event_] : never>;
declare type IsAny<T> = 0 extends 1 & T ? true : false;
declare type IfAny<T, TypeIfAny = true, TypeIfNotAny = false> = IsAny<T> extends true ? TypeIfAny : TypeIfNotAny;
export declare type Last<ValueType extends readonly unknown[]> = ValueType extends readonly [infer ElementType] ? ElementType : ValueType extends readonly [infer _, ...infer Tail] ? Last<Tail> : ValueType extends ReadonlyArray<infer ElementType> ? ElementType : never;
export declare type FirstNonErrorTuple<T extends unknown[]> = T[0] extends Error ? T[1] : T[0];
// export declare type FirstNonErrorArg<T> = T extends (...arguments_: infer Parameters_) => any ? FirstNonErrorTuple<Parameters_> : any;
export declare type AllButLast<T extends any[]> = T extends [...infer H, infer _L] ? H : any[];

export declare type FirstNonErrorArg<T> = T extends (...arguments_: infer Parameters_) => any ? FirstNonErrorTuple<Parameters_> : any;
export declare type EventNamesWithAck<Map extends EventsMap, K extends EventNames<Map> = EventNames<Map>> = IfAny<Last<Parameters<Map[K]>> | Map[K], K, K extends (Last<Parameters<Map[K]>> extends (...arguments_: any[]) => any ? FirstNonErrorArg<Last<Parameters<Map[K]>>> extends void ? never : K : never) ? K : never>;

export declare type EventListener<Event_ extends ReservedOrUserEventNames<Record<string, unknown>, ClientToServerEvents>> = ReservedOrUserListener<Record<string, unknown>, ClientToServerEvents, Event_>;

export type CallbackWithError<Value> = (data: Result<Error, Value>) => void;

export type ClientToServerEvents = {
	'message:send': (data: {
		to: string;
		message: MessageType;
		timestamp: number;
	}, callback: CallbackWithError<Record<string, unknown>>) => void;
	'message:ack': (data: {
		lastReceivedMessageId: number;
	}, callback: CallbackWithError<Record<string, unknown>>) => void;
	'keyBundle:save': (data: {
		registrationId: number;
		identityPubKey: ArrayBuffer;
		signedPreKey: SignedPublicPreKeyType;
		oneTimePreKeys: PreKeyType[];
	}, callback: CallbackWithError<Record<string, unknown>>) => void;
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
		fastify: FastifyTypebox;
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
