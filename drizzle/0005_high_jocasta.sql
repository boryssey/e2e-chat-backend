ALTER TABLE "one_time_keys" RENAME COLUMN "key" TO "pub_key";--> statement-breakpoint
ALTER TABLE "key_bundles" ADD COLUMN "registration_id" integer NOT NULL;