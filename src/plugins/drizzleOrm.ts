import fp from 'fastify-plugin';
import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';

export default fp(async (fastify, _options) => {
	if (!fastify.drizzle) {
		const queryClient = postgres({
			host: process.env.DATABASE_HOST ?? 'localhost',
			port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
			database: process.env.DATABASE_NAME,
			user: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			// ssl: true,
			// ssl: {rejectUnauthorized: false},
		});
		const client = drizzle(queryClient, {schema, logger: true});
		fastify.decorate('drizzle', client);
	}
}, {
	name: 'drizzle-orm',
});

declare const database: ReturnType<typeof drizzle<typeof schema>>;

export type DrizzleType = typeof database;

declare module 'fastify' {
	export interface FastifyInstance {
		drizzle: typeof database;
	}
}
