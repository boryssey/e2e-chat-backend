import type {Config} from 'drizzle-kit';

export default {
	schema: './src/schema.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		host: process.env.DATABASE_HOST ?? 'localhost',
		port: 5432,
		database: process.env.DATABASE_NAME ?? 'postgres',
		user: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD,
		// ssl: true,
		ssl: false,
	},
} satisfies Config;
