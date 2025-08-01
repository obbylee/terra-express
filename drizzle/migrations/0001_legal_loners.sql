ALTER TABLE "space_to_categories" ALTER COLUMN "space_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "space_to_categories" ALTER COLUMN "category_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "space_to_features" ALTER COLUMN "space_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "space_to_features" ALTER COLUMN "feature_id" SET DATA TYPE uuid;