CREATE TABLE IF NOT EXISTS "user" (
	"id" serial NOT NULL,
	"username" text,
	"password" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
