import {type FastifyReply, type FastifyRequest, type HookHandlerDoneFunction} from 'fastify';
import {type User} from '../schema';

export const verifyJwtCookie = async (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
	try {
		const {accessToken} = request.cookies;
		if (!accessToken) {
			void reply.code(401).send({message: 'Unauthorized'});
			done(new Error('Unauthorized'));
			return;
		}

		const user = (request.jwt.decode<Omit<User, 'password'>>(accessToken)!);
		request.user = user;
		done();
	} catch {
		void reply.code(401).send({message: 'Unauthorized'});
		done(new Error('Unauthorized'));
	}
};
