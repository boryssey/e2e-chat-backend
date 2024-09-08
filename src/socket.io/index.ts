
import {type FastifyInstance} from 'fastify';
import {
	type ClientToServerEvents,
	type FastifySocket,
} from '../utils/types';
import {type DrizzleType} from '../plugins/drizzleOrm';
import registerKeyBundleHandlers, {emitSavedMessagesToUser} from './keybundle'; // eslint-disable-line import/no-cycle
// eslint-disable-next-line import/no-cycle
import registerMessageHandlers from './messages';

export type EventHandlerRegisterer = (io: FastifyInstance['io'],
	socket: FastifySocket,
	drizzle: DrizzleType) => void;

const onConnection = async (
	io: FastifyInstance['io'],
	socket: FastifySocket,
	drizzle: DrizzleType,
) => {
	socket.data.user = socket.request.session!;

	registerKeyBundleHandlers(io, socket, drizzle);
	registerMessageHandlers(io, socket, drizzle);

	await emitSavedMessagesToUser(socket, drizzle);
};

type HandlerFunction<T extends keyof ClientToServerEvents> = (
	data: Parameters<ClientToServerEvents[T]>[0]
) => Promise<Parameters<Parameters<ClientToServerEvents[T]>[1]>[0]>;

export const eventHandler
  = async <T extends keyof ClientToServerEvents>(handler: HandlerFunction<T>) =>
  	async ([data, callback]: Parameters<ClientToServerEvents[T]>) => {
  		try {
  			const result = await handler(data);
  			if (result.success) {
  				callback(result);
  			}
  		} catch (error) {
  			if (error instanceof Error) {
  				callback({
  					success: false,
  					error,
  				});
  			}
  		}
  	};

export default onConnection;
