ALTER TABLE "users" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "one_time_keys" ADD CONSTRAINT "one_time_keys_key_id_unique" UNIQUE("key_id");