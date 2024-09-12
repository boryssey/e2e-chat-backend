CREATE TABLE IF NOT EXISTS "disposable_chats" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user1_id" integer,
	"user2_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "disposable_chats_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "key_bundles" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "messages" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "one_time_keys" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "users" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "disposable_chats" ADD CONSTRAINT "disposable_chats_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "disposable_chats" ADD CONSTRAINT "disposable_chats_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
