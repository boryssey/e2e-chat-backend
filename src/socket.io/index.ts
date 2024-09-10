
import {type FastifyInstance} from 'fastify';
import {
	type ClientToServerEvents,
	type FastifySocket,

	type AllButLast,
	type EventNames,
	type Last,
} from '../utils/types';
import {type DrizzleType} from '../plugins/drizzleOrm';
import registerKeyBundleHandlers from './keyBundle'; // eslint-disable-line import/no-cycle
// eslint-disable-next-line import/no-cycle
import registerMessageHandlers from './messages';

export type EventHandlerRegisterer = (io: FastifyInstance['io'],
	socket: FastifySocket,
	drizzle: DrizzleType) => void;

const onConnection = (
	io: FastifyInstance['io'],
	socket: FastifySocket,
	drizzle: DrizzleType,
) => {
	socket.data.user = socket.request.session!;

	registerKeyBundleHandlers(io, socket, drizzle);
	registerMessageHandlers(io, socket, drizzle);
};

type HandlerFunction<T extends keyof ClientToServerEvents> = (
	...arguments_: AllButLast<Parameters<ClientToServerEvents[T]>>
) => Promise<Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]>;

export const eventHandler
  = <T extends EventNames<ClientToServerEvents>>(handler: HandlerFunction<T>) =>
  	 (async function (...arguments_: Parameters<ClientToServerEvents[T]>) {
  		const callback = arguments_.pop() as Last<Parameters<ClientToServerEvents[T]>>;
  		const data = arguments_ as any[] as AllButLast<Parameters<ClientToServerEvents[T]>>;
  		try {
  			const result = await handler(...data);
  			callback(result);
  		} catch (error) {
  			if (error instanceof Error) {
  				callback({
  					success: false,
  					error,
  				});
  			} else {
  				callback({
  					success: false,
  					error: new Error('Something went wrong'),
  				});
  			}
  		}
  	});

export default onConnection;
