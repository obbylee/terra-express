ALTER TABLE "space" RENAME COLUMN "submittedBy" TO "submitted_by";--> statement-breakpoint
ALTER TABLE "space" RENAME COLUMN "typeId" TO "type_id";--> statement-breakpoint
ALTER TABLE "space" DROP CONSTRAINT "space_submittedBy_users_id_fk";
--> statement-breakpoint
ALTER TABLE "space" DROP CONSTRAINT "space_typeId_space_type_id_fk";
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "feature" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "space" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "space" ALTER COLUMN "alternateNames" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "space" ALTER COLUMN "activities" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "space" ALTER COLUMN "operatingHours" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "space" ALTER COLUMN "entranceFee" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "space" ALTER COLUMN "contactInfo" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "space" ALTER COLUMN "accessibility" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "space_type" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "passwordHash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "space" ADD CONSTRAINT "space_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space" ADD CONSTRAINT "space_type_id_space_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."space_type"("id") ON DELETE cascade ON UPDATE no action;