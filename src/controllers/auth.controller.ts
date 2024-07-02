import {type FastifyReply, type FastifyRequest} from 'fastify';
import bcrypt from 'bcrypt';
import {type CookieSerializeOptions} from '@fastify/cookie';
import {type loginOptions, type registerOptions} from '../routes/auth.route';
import {createUser, findUserById, findUserByUsername} from '../services/user.service';
import {MONTH} from '../utils/constants';
import {type FastifyReplyTypebox, type FastifyRequestTypebox} from '../utils/types';

const cookieOptions: CookieSerializeOptions = process.env.NODE_ENV === 'production' ? {
	path: '/',
	domain: process.env.COOKIE_DOMAIN,
	secure: true,
	sameSite: 'strict',
	maxAge: MONTH,
} : {
	path: '/',
	domain: 'localhost',
	secure: false,
	sameSite: 'lax',
	maxAge: MONTH,
};

export const registerController = async (request: FastifyRequest & FastifyRequestTypebox<typeof registerOptions.schema>, reply: FastifyReplyTypebox<Record<string, unknown>>) => {
	try {
		const {username, password} = request.body;
		const [existingUser] = await findUserByUsername(request.fastify.drizzle, username);

		if (existingUser) {
			return await reply.status(400).send({message: 'User already exists'});
		}

		const passwordHash = await bcrypt.hash(password, 12);
		const [newUser] = await createUser(request.fastify.drizzle, {username, password: passwordHash});
		const accessToken = request.jwt.sign(newUser);

		void reply.setCookie('accessToken', accessToken, cookieOptions);
		return await reply.send(newUser);
	} catch (error) {
		console.error(error);
		return reply.status(500).send({message: 'Internal server error'});
	}
};

export const loginController = async (request: FastifyRequest & FastifyRequestTypebox<typeof loginOptions.schema>, reply: FastifyReplyTypebox<Record<string, unknown>>) => {
	try {
		const {username, password} = request.body;
		const [existingUser] = await findUserByUsername(request.fastify.drizzle, username);
		if (!existingUser) {
			return await reply.status(401).send({message: 'Invalid credentials'});
		}

		const {password: passwordHash, ...user} = existingUser;
		const passwordMatch = await bcrypt.compare(password, passwordHash);
		if (!passwordMatch) {
			return await reply.status(401).send({message: 'Invalid credentials'});
		}

		const accessToken = request.jwt.sign(user);

		void reply.setCookie('accessToken', accessToken, cookieOptions);
		return await reply.send(user);
	} catch (error) {
		console.error(error);
		return reply.status(500).send({message: 'Internal server error'});
	}
};

export const logoutController = (_request: FastifyRequest, reply: FastifyReply) => {
	try {
		void reply.clearCookie('accessToken', cookieOptions);
		return reply.status(200).send();
	} catch (error) {
		console.error(error);
		return reply.status(500).send({message: 'Internal server error'});
	}
};

export const meController = async (request: FastifyRequest & FastifyRequestTypebox<Record<string, unknown>>, reply: FastifyReply) => {
	const [user] = await findUserById(request.fastify.drizzle, request.user.id);

	if (!user) {
		console.warn('no user, clearing cookie');
		return reply.clearCookie('accessToken', cookieOptions).status(401).send({message: 'Unauthorized'});
		// return reply.status(401).send({message: 'Unauthorized'});
	}

	return reply.status(200).send(user);
};
