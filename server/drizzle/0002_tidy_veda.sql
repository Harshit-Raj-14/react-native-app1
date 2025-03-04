ALTER TABLE "feedback" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "feedback_text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "friends" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "friends" ALTER COLUMN "friend_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "referrals" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;