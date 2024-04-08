const { drizzle } = require("drizzle-orm/postgres-js");
const { migrate } = require("drizzle-orm/postgres-js/migrator");

const postgres = require( "postgres");



const main = async () => {
    const sql = postgres({
        host: process.env.DATABASE_HOST || 'localhost',
        port: 5432,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        // ssl: true,
        ssl: { rejectUnauthorized: false }
    }, { max: 1 })
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder: "drizzle" });
    await sql.end();
}
main()