import 'dotenv/config';

const {drizzle} = require('drizzle-orm/postgres-js');
const {migrate} = require('drizzle-orm/postgres-js/migrator');
const postgres = require('postgres');

const main = async () => {
	const sql = postgres({
		host: '49.13.173.235' || 'localhost',
		port: 5433,
		database: process.env.DATABASE_NAME,
		user: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD,
		// ssl: true,
		// ssl: {rejectUnauthorized: false},
	}, {max: 1});
	const database = drizzle(sql);
	await migrate(database, {migrationsFolder: 'drizzle'});
	await sql.end();
};

main();
