--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_unique" UNIQUE("id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "key_bundles" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"identity_pub_key" "bytea" NOT NULL,
	"signed_pre_key" integer NOT NULL,
	"signed_pre_key_signature" "bytea" NOT NULL,
	"signed_pre_key_pub_key" "bytea" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "key_bundles_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "one_time_keys" (
	"id" serial NOT NULL,
	"key_bundle_id" integer NOT NULL,
	"key_id" integer NOT NULL,
	"key" "bytea" NOT NULL,
	CONSTRAINT "one_time_keys_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "key_bundles" ADD CONSTRAINT "key_bundles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "one_time_keys" ADD CONSTRAINT "one_time_keys_key_bundle_id_key_bundles_id_fk" FOREIGN KEY ("key_bundle_id") REFERENCES "key_bundles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

