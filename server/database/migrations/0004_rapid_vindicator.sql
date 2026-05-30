CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted');--> statement-breakpoint
ALTER TABLE "friendships" ALTER COLUMN "status" SET DATA TYPE "public"."friendship_status" USING "status"::"public"."friendship_status";--> statement-breakpoint
CREATE INDEX "idx_channels_server" ON "channels" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_dm_sender_receiver_created" ON "dm_messages" USING btree ("sender_id","receiver_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_dm_receiver_sender_created" ON "dm_messages" USING btree ("receiver_id","sender_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_friendships_sender" ON "friendships" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "idx_friendships_receiver" ON "friendships" USING btree ("receiver_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_friendships_pair" ON "friendships" USING btree ("sender_id","receiver_id");--> statement-breakpoint
CREATE INDEX "idx_messages_channel_created" ON "messages" USING btree ("channel_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_user" ON "messages" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_server_members_unique" ON "server_members" USING btree ("server_id","user_id");